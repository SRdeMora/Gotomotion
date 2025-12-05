import express from 'express';
import { PrismaClient } from '@prisma/client';
import { query } from 'express-validator';
import { getAllCategories, isTeamCategory } from '../utils/enums';

const router = express.Router();
const prisma = new PrismaClient();

// Calcular y asignar premios anuales
router.post(
  '/calculate',
  [
    query('year').isInt({ min: 2020 }),
  ],
  async (req, res, next) => {
    try {
      const { year } = req.query;

      // Obtener ganadores por categoría (mayor puntuación anual)
      const categories = getAllCategories();
      const awards = [];

      for (const category of categories) {
        // Obtener todos los videos de esta categoría en este año
        const videos = await prisma.video.findMany({
          where: {
            categories: { contains: category },
            year: Number(year),
          },
          include: {
            author: true,
          },
        });

        // Agrupar por autor y sumar puntos
        const userPoints: { [userId: string]: { user: any; totalPoints: number } } = {};

        for (const video of videos) {
          if (!userPoints[video.authorId]) {
            userPoints[video.authorId] = {
              user: video.author,
              totalPoints: 0,
            };
          }
          userPoints[video.authorId].totalPoints += video.totalPoints;
        }

        // Ordenar por puntos y obtener el ganador
        const sortedUsers = Object.values(userPoints).sort(
          (a, b) => b.totalPoints - a.totalPoints
        );

        if (sortedUsers.length > 0 && sortedUsers[0].totalPoints > 0) {
          const winner = sortedUsers[0];
          
          // Determinar valor del premio según categoría
          const hasTeamCategory = isTeamCategory(category);
          const prizeValue = hasTeamCategory ? 3000 : 2000;
          const prize = `Alquiler de equipo valorado en ${prizeValue}€ en VISUALRENT`;

          // Crear o actualizar premio
          const award = await prisma.award.upsert({
            where: {
              category_year_position: {
                category,
                year: Number(year),
                position: 1,
              },
            },
            update: {
              userId: winner.user.id,
              prize,
              prizeValue,
            },
            create: {
              category,
              year: Number(year),
              position: 1,
              userId: winner.user.id,
              prize,
              prizeValue,
            },
          });

          awards.push(award);
        }
      }

      res.json({ awards, message: 'Premios calculados correctamente' });
    } catch (error) {
      next(error);
    }
  }
);

// Obtener premios de un año
router.get(
  '/',
  [
    query('year').optional().isInt({ min: 2020 }),
  ],
  async (req, res, next) => {
    try {
      const { year } = req.query;

      const where: any = {};
      if (year) {
        where.year = Number(year);
      }

      const awards = await prisma.award.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          { year: 'desc' },
          { category: 'asc' },
        ],
      });

      res.json({ awards });
    } catch (error) {
      next(error);
    }
  }
);

// Obtener premios de un usuario
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const awards = await prisma.award.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { category: 'asc' },
      ],
    });

    res.json({ awards });
  } catch (error) {
    next(error);
  }
});

export default router;

