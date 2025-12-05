import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { getAllCategories, isValidCategory } from '../utils/enums';

const router = express.Router();
const prisma = new PrismaClient();

// Vote for a video in a specific category
router.post(
  '/:videoId',
  authenticate,
  [body('category').custom((value) => {
    if (!isValidCategory(value)) {
      throw new Error('Categoría inválida');
    }
    return true;
  }).notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { videoId } = req.params;
      const { category } = req.body;
      const userId = req.user!.id;

      // Check if video exists
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        return res.status(404).json({ error: 'Video no encontrado' });
      }

      // Verificar que el video está inscrito en esta categoría
      // En SQLite: categories es String (JSON), en PostgreSQL es array
      const videoCategories = typeof video.categories === 'string' 
        ? JSON.parse(video.categories || '[]') 
        : video.categories;
      if (!videoCategories.includes(category)) {
        return res.status(400).json({ error: 'El video no está inscrito en esta categoría' });
      }

      // IMPORTANTE: Verificar que el usuario NO haya votado por OTRO video 
      // en la misma categoría dentro de la misma liga (round + year)
      // Cada usuario solo puede votar UNA VEZ por cada categoría dentro de cada liga
      const existingVoteInLeague = await prisma.vote.findFirst({
        where: {
          userId,
          category: category as string,
          video: {
            round: video.round,
            year: video.year,
          },
        },
      });

      if (existingVoteInLeague) {
        // Si ya votó por otro video en esta categoría en esta liga
        if (existingVoteInLeague.videoId !== videoId) {
          return res.status(400).json({ 
            error: `Ya has votado por otra obra en la categoría "${category}" en esta liga. Solo puedes votar una vez por categoría dentro de cada liga.` 
          });
        }
        // Si ya votó por este mismo video en esta categoría
        return res.status(400).json({ error: 'Ya has votado por este video en esta categoría' });
      }

      // Create vote
      const vote = await prisma.vote.create({
        data: {
          userId,
          videoId,
          category: category as string,
        },
      });

      // Actualizar contador de votos públicos del video
      await prisma.video.update({
        where: { id: videoId },
        data: {
          publicVotes: {
            increment: 1,
          },
          totalPoints: {
            increment: 1, // Cada voto público cuenta como 1 punto
          },
        },
      });

      res.status(201).json({ vote, message: 'Voto registrado correctamente' });
    } catch (error) {
      next(error);
    }
  }
);

// Remove vote
router.delete('/:videoId', authenticate, [body('category').custom((value) => {
  if (!isValidCategory(value)) {
    throw new Error('Categoría inválida');
  }
  return true;
})], async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { videoId } = req.params;
    const { category } = req.body;
    const userId = req.user!.id;

    const vote = await prisma.vote.deleteMany({
      where: {
        userId,
        videoId,
        category: category as string,
      },
    });

    if (vote.count === 0) {
      return res.status(404).json({ error: 'Voto no encontrado' });
    }

    // Decrementar contador
    await prisma.video.update({
      where: { id: videoId },
      data: {
        publicVotes: {
          decrement: 1,
        },
        totalPoints: {
          decrement: 1,
        },
      },
    });

    res.json({ message: 'Voto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

// Check if user has voted for a video in a category
router.get('/:videoId/check', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const { category } = req.query;
    const userId = req.user!.id;

    // Obtener el video para conocer su liga (round + year)
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        round: true,
        year: true,
        categories: true,
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    if (!category) {
      // Si no se especifica categoría, devolver todas las categorías votadas
      // en esta liga (round + year)
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          video: {
            round: video.round,
            year: video.year,
          },
        },
        select: {
          category: true,
        },
      });

      // Parsear categorías del video
      const videoCategories = typeof video.categories === 'string'
        ? JSON.parse(video.categories || '[]')
        : video.categories || [];

      return res.json({
        hasVoted: votes.length > 0,
        votedCategories: votes.map(v => v.category),
        availableCategories: videoCategories,
      });
    }

    // Verificar si el usuario ya votó por esta categoría en esta liga
    const vote = await prisma.vote.findFirst({
      where: {
        userId,
        category: category as string,
        video: {
          round: video.round,
          year: video.year,
        },
      },
    });

    res.json({ hasVoted: !!vote });
  } catch (error) {
    next(error);
  }
});

export default router;

