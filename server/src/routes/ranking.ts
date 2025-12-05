import express from 'express';
import { PrismaClient } from '@prisma/client';
import { query } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get ranking
router.get(
  '/',
  [
    query('round').optional().isInt(),
    query('year').optional().isInt(),
    query('category').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const { round, year, category, limit = 50 } = req.query;

      const where: any = {};
      if (round) {
        where.round = Number(round);
      }
      if (year) {
        where.year = Number(year);
      }
      if (category) {
        // Compatible con SQLite (String) y PostgreSQL (array)
        where.categories = { contains: category as string };
      }

      const videos = await prisma.video.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              totalPoints: true,
            },
          },
          _count: {
            select: { votes: true },
          },
        },
        orderBy: {
          totalPoints: 'desc', // Ordenar por puntos totales (públicos + jurado)
        },
        take: Number(limit),
      });

      const ranking = videos.map((video, index) => ({
        position: index + 1,
        video: {
          ...video,
          publicVotes: video.publicVotes,
          juryPoints: video.juryPoints,
          totalPoints: video.totalPoints,
        },
      }));

      res.json({ ranking });
    } catch (error) {
      next(error);
    }
  }
);

// Get user ranking position (por puntos anuales)
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;

    const currentYear = year ? Number(year) : new Date().getFullYear();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        totalPoints: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener todos los usuarios ordenados por puntos anuales
    const allUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM'],
        },
      },
      select: {
        id: true,
        totalPoints: true,
      },
      orderBy: {
        totalPoints: 'desc',
      },
    });

    const userPosition = allUsers.findIndex((u) => u.id === userId) + 1;

    // Obtener videos del usuario en este año
    const userVideos = await prisma.video.findMany({
      where: {
        authorId: userId,
        year: currentYear,
      },
      select: {
        id: true,
        title: true,
        round: true,
        totalPoints: true,
        publicVotes: true,
        juryPoints: true,
      },
    });

    const totalPoints = userVideos.reduce(
      (sum, video) => sum + video.totalPoints,
      0
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        totalPoints: user.totalPoints,
      },
      position: userPosition > 0 ? userPosition : null,
      videos: userVideos.length,
      year: currentYear,
      videosByRound: userVideos,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

