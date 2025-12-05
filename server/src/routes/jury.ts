import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidCategory, getAllCategories } from '../utils/enums';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar que es jurado
const isJury = async (req: AuthRequest, res: any, next: any) => {
  // Verificar si el usuario está en la tabla de jurados
  const juryMember = await prisma.juryMember.findFirst({
    where: { userId: req.user!.id },
  });

  if (!juryMember) {
    return res.status(403).json({ error: 'Solo los miembros del jurado pueden realizar esta acción' });
  }

  req.user = { ...req.user, juryId: juryMember.id } as any;
  next();
};

// Votar por un video (jurado)
router.post(
  '/vote',
  authenticate,
  isJury,
  [
    body('videoId').isString().notEmpty(),
    body('category').custom((value) => {
      if (!isValidCategory(value)) {
        throw new Error('Categoría inválida');
      }
      return true;
    }),
    body('round').isInt({ min: 1 }),
    body('year').isInt({ min: 2020 }),
    body('position').isInt({ min: 1, max: 5 }), // Posición en el ranking (1-5)
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { videoId, category, round, year, position } = req.body;
      const juryId = (req.user as any).juryId;

      // Verificar que el video existe y está en la categoría correcta
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        return res.status(404).json({ error: 'Video no encontrado' });
      }

      // En SQLite: categories es String (JSON), en PostgreSQL es array
      const videoCategories = typeof video.categories === 'string'
        ? JSON.parse(video.categories || '[]')
        : video.categories;
      if (!videoCategories.includes(category)) {
        return res.status(400).json({ error: 'El video no está inscrito en esta categoría' });
      }

      if (video.round !== round || video.year !== year) {
        return res.status(400).json({ error: 'El video no pertenece a esta liga' });
      }

      // Calcular puntos según posición (3 puntos top 2, 2 puntos top 5)
      const points = position <= 2 ? 3 : position <= 5 ? 2 : 0;

      if (points === 0) {
        return res.status(400).json({ error: 'Solo se pueden votar los top 5' });
      }

      // Verificar si ya votó este jurado por este video en esta categoría
      const existingVote = await prisma.juryVote.findUnique({
        where: {
          juryMemberId_videoId_category_round_year: {
            juryMemberId: juryId,
            videoId,
            category,
            round,
            year,
          },
        },
      });

      if (existingVote) {
        return res.status(400).json({ error: 'Ya has votado por este video en esta categoría' });
      }

      // Crear voto del jurado
      const juryVote = await prisma.juryVote.create({
        data: {
          juryMemberId: juryId,
          videoId,
          category,
          round,
          year,
          points,
        },
      });

      // Actualizar puntos del video
      await prisma.video.update({
        where: { id: videoId },
        data: {
          juryPoints: {
            increment: points,
          },
          totalPoints: {
            increment: points,
          },
        },
      });

      res.status(201).json({ juryVote, message: 'Voto del jurado registrado' });
    } catch (error) {
      next(error);
    }
  }
);

// Obtener ranking para jurado (top videos por categoría)
router.get(
  '/ranking',
  authenticate,
  isJury,
  [
    query('category').custom((value) => {
      if (!isValidCategory(value)) {
        throw new Error('Categoría inválida');
      }
      return true;
    }),
    query('round').isInt({ min: 1 }),
    query('year').isInt({ min: 2020 }),
    query('limit').optional().isInt({ min: 1, max: 10 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category, round, year, limit = 10 } = req.query;

      // Obtener top videos por votos públicos en esta categoría y liga
      const videos = await prisma.video.findMany({
        where: {
          categories: { contains: category as string },
          round: Number(round),
          year: Number(year),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: {
          votes: {
            _count: 'desc',
          },
        },
        take: Number(limit),
      });

      const ranking = videos.map((video, index) => ({
        position: index + 1,
        video: {
          ...video,
          publicVotes: video._count.votes,
        },
      }));

      res.json({ ranking });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

