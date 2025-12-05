import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, query } from 'express-validator';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las ligas
router.get(
  '/',
  [
    query('year').optional().isInt({ min: 2020 }),
    query('active').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const { year, active } = req.query;

      const where: any = {};
      if (year) {
        where.year = Number(year);
      }
      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      const leagues = await prisma.league.findMany({
        where,
        orderBy: [
          { year: 'desc' },
          { round: 'asc' },
        ],
      });

      res.json({ leagues });
    } catch (error) {
      next(error);
    }
  }
);

// Obtener liga actual
router.get('/current', async (req, res, next) => {
  try {
    const now = new Date();
    
    const league = await prisma.league.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: {
        round: 'desc',
      },
    });

    if (!league) {
      return res.status(404).json({ error: 'No hay liga activa actualmente' });
    }

    res.json({ league });
  } catch (error) {
    next(error);
  }
});

// Crear/actualizar liga (admin)
router.post(
  '/',
  authenticate,
  authorize('PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM'), // En producción, crear rol ADMIN
  [
    body('round').isInt({ min: 1 }),
    body('year').isInt({ min: 2020 }),
    body('name').optional().isString(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('juryEndDate').isISO8601(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { round, year, name, startDate, endDate, juryEndDate } = req.body;

      const league = await prisma.league.upsert({
        where: { round },
        update: {
          year: Number(year),
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          juryEndDate: new Date(juryEndDate),
          isActive: true,
        },
        create: {
          round: Number(round),
          year: Number(year),
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          juryEndDate: new Date(juryEndDate),
          isActive: true,
        },
      });

      res.status(201).json({ league });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

