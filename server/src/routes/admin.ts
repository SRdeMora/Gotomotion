import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult, query } from 'express-validator';
import { USER_ROLES, CATEGORIES, getAllCategories, isTeamCategory } from '../utils/enums';

const router = express.Router();
const prisma = new PrismaClient();

// Endpoint de diagnóstico para verificar configuración
router.get('/diagnostics', authenticate, async (req: AuthRequest, res) => {
  try {
    const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsRaw
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
    
    const userEmail = req.user?.email?.toLowerCase().trim() || '';
    const isAdmin = adminEmails.length > 0 && adminEmails.includes(userEmail);
    
    // Log detallado para debugging (siempre en producción también para troubleshooting)
    console.log('[ADMIN DIAGNOSTICS]', {
      adminEmailsRaw,
      adminEmails,
      userEmail,
      isAdmin,
      envLoaded: !!process.env.ADMIN_EMAILS,
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    
    res.json({
      configured: adminEmails.length > 0,
      adminEmailsRaw,
      adminEmails,
      userEmail,
      isAdmin,
      envLoaded: !!process.env.ADMIN_EMAILS,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('ADMIN') || k.includes('EMAIL')),
    });
  } catch (error: any) {
    console.error('[ADMIN DIAGNOSTICS] Error:', error);
    res.status(500).json({
      error: 'Error al obtener diagnóstico',
      message: error.message,
    });
  }
});

// Middleware profesional para verificar que es admin
const isAdmin = async (req: AuthRequest, res: any, next: any): Promise<void> => {
  try {
    // Leer ADMIN_EMAILS directamente de process.env (ya cargado por dotenv)
    const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
    
    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[ADMIN] Verificando acceso admin...');
      console.log('[ADMIN] ADMIN_EMAILS raw:', adminEmailsRaw);
      console.log('[ADMIN] ADMIN_EMAILS existe:', !!process.env.ADMIN_EMAILS);
    }
    
    const adminEmails = adminEmailsRaw
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
    
    if (adminEmails.length === 0) {
      console.error('❌ [ADMIN] ADMIN_EMAILS no está configurado o está vacío');
      console.error('❌ [ADMIN] Valor leído:', adminEmailsRaw);
      console.error('❌ [ADMIN] Variables de entorno disponibles:', Object.keys(process.env).filter(k => k.includes('ADMIN')));
      
      return res.status(500).json({ 
        error: 'Configuración de administrador no encontrada',
        message: 'ADMIN_EMAILS no está configurado en server/.env',
        debug: process.env.NODE_ENV === 'development' ? {
          adminEmailsRaw,
          envFileExists: require('fs').existsSync(require('path').join(__dirname, '../../.env')),
        } : undefined,
      });
    }
    
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const userEmail = req.user.email.toLowerCase().trim();
    const isAdminUser = adminEmails.includes(userEmail);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ADMIN] Email del usuario:', userEmail);
      console.log('[ADMIN] Emails admin configurados:', adminEmails);
      console.log('[ADMIN] Es admin?', isAdminUser);
    }
    
    if (!isAdminUser) {
      console.log(`❌ [ADMIN] Acceso denegado. Email: ${userEmail}, Admin emails: ${adminEmails.join(', ')}`);
      return res.status(403).json({ 
        error: 'Acceso solo para administradores',
        message: `Tu email (${userEmail}) no está en la lista de administradores`,
        hint: 'Verifica ADMIN_EMAILS en server/.env y reinicia el servidor',
        debug: process.env.NODE_ENV === 'development' ? {
          userEmail,
          adminEmails,
        } : undefined,
      });
    }
    
    console.log(`✅ [ADMIN] Acceso permitido para: ${userEmail}`);
    next();
  } catch (error: any) {
    console.error('❌ [ADMIN] Error en middleware isAdmin:', error);
    return res.status(500).json({
      error: 'Error al verificar permisos de administrador',
      message: error.message,
    });
  }
};

// ==================== ESTADÍSTICAS GENERALES ====================

// Dashboard principal con todas las estadísticas
router.get('/dashboard', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    // Usuarios
    const totalUsers = await prisma.user.count();
    const voters = await prisma.user.count({ where: { role: USER_ROLES.VOTER } });
    const participants = await prisma.user.count({
      where: {
        role: { in: [USER_ROLES.PARTICIPANT_INDIVIDUAL, USER_ROLES.PARTICIPANT_TEAM] },
      },
    });

    // Videos
    const totalVideos = await prisma.video.count(dateFilter);
    const videosByCategory = await prisma.video.groupBy({
      by: ['categories'],
      _count: true,
      ...(Object.keys(dateFilter).length > 0 && { where: dateFilter }),
    });

    // Votos
    const totalVotes = await prisma.vote.count(dateFilter);
    const votesByCategory = await prisma.vote.groupBy({
      by: ['category'],
      _count: true,
      ...(Object.keys(dateFilter).length > 0 && { where: dateFilter }),
    });

    // Pagos
    const totalPayments = await prisma.payment.count(dateFilter);
    const completedPayments = await prisma.payment.count({
      where: { ...dateFilter, status: 'completed' },
    });
    const totalRevenue = await prisma.payment.aggregate({
      where: { ...dateFilter, status: 'completed' },
      _sum: { amount: true },
    });

    // Ligas
    const activeLeagues = await prisma.league.count({ where: { isActive: true } });
    const totalLeagues = await prisma.league.count();

    // Videos por liga
    const videosByRound = await prisma.video.groupBy({
      by: ['round'],
      _count: true,
      ...(Object.keys(dateFilter).length > 0 && { where: dateFilter }),
    });

    res.json({
      users: {
        total: totalUsers,
        voters,
        participants,
        byRole: {
          voters,
          individual: await prisma.user.count({ where: { role: USER_ROLES.PARTICIPANT_INDIVIDUAL } }),
          teams: await prisma.user.count({ where: { role: USER_ROLES.PARTICIPANT_TEAM } }),
        },
      },
      videos: {
        total: totalVideos,
        byCategory: videosByCategory,
        byRound: videosByRound,
      },
      votes: {
        total: totalVotes,
        byCategory: votesByCategory,
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: totalPayments - completedPayments,
        revenue: totalRevenue._sum.amount || 0,
      },
      leagues: {
        total: totalLeagues,
        active: activeLeagues,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== GESTIÓN DE LIGAS ====================

// Listar todas las ligas con estadísticas
router.get('/leagues', authenticate, isAdmin, async (req, res, next) => {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: [
        { year: 'desc' },
        { round: 'desc' },
      ],
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    const leaguesWithStats = await Promise.all(
      leagues.map(async (league) => {
        const videos = await prisma.video.count({ where: { round: league.round, year: league.year } });
        const votes = await prisma.vote.count({
          where: {
            video: {
              round: league.round,
              year: league.year,
            },
          },
        });
        const participants = await prisma.user.count({
          where: {
            videos: {
              some: {
                round: league.round,
                year: league.year,
              },
            },
          },
        });

        return {
          ...league,
          stats: {
            videos,
            votes,
            participants,
          },
        };
      })
    );

    res.json({ leagues: leaguesWithStats });
  } catch (error) {
    next(error);
  }
});

// Crear/actualizar liga
router.post(
  '/leagues',
  authenticate,
  isAdmin,
  [
    body('round').isInt({ min: 1, max: 6 }),
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

      // Buscar liga existente por round y year
      const existingLeague = await prisma.league.findFirst({
        where: {
          round: Number(round),
          year: Number(year),
        },
      });

      const league = existingLeague
        ? await prisma.league.update({
            where: { id: existingLeague.id },
            data: {
              name,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              juryEndDate: new Date(juryEndDate),
              isActive: true,
            },
          })
        : await prisma.league.create({
            data: {
              round: Number(round),
              year: Number(year),
              name: name || `Liga ${round} - ${year}`,
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

// Abrir/cerrar liga
router.patch(
  '/leagues/:round/status',
  authenticate,
  isAdmin,
  [
    body('isActive').isBoolean(),
    query('year').optional().isInt({ min: 2020 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { round } = req.params;
      const { isActive } = req.body;
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

      // Buscar liga por round y year
      const existingLeague = await prisma.league.findFirst({
        where: {
          round: Number(round),
          year,
        },
      });

      if (!existingLeague) {
        return res.status(404).json({ error: 'Liga no encontrada' });
      }

      const league = await prisma.league.update({
        where: { id: existingLeague.id },
        data: { isActive },
      });

      res.json({ league });
    } catch (error) {
      next(error);
    }
  }
);

// Eliminar liga
router.delete(
  '/leagues/:round',
  authenticate,
  isAdmin,
  [
    query('year').optional().isInt({ min: 2020 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { round } = req.params;
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

      // Buscar liga por round y year
      const existingLeague = await prisma.league.findFirst({
        where: {
          round: Number(round),
          year,
        },
        include: {
          _count: {
            select: {
              videos: true,
            },
          },
        },
      });

      if (!existingLeague) {
        return res.status(404).json({ error: 'Liga no encontrada' });
      }

      // Verificar si tiene videos asociados
      if (existingLeague._count.videos > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la liga',
          message: `Esta liga tiene ${existingLeague._count.videos} video(s) asociado(s). Primero debes eliminar o mover los videos.`,
        });
      }

      // Eliminar la liga
      await prisma.league.delete({
        where: { id: existingLeague.id },
      });

      res.json({ message: 'Liga eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== RANKINGS Y ESTADÍSTICAS ====================

// Ranking completo por categoría/liga
router.get('/rankings', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { category, round, year, startDate, endDate } = req.query;

    const where: any = {};
    if (category) {
      where.categories = { contains: category as string };
    }
    if (round) {
      where.round = Number(round);
    }
    if (year) {
      where.year = Number(year);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
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
      },
      orderBy: {
        totalPoints: 'desc',
      },
    });

    res.json({ rankings: videos });
  } catch (error) {
    next(error);
  }
});

// Estadísticas de usuarios
router.get('/users/stats', authenticate, isAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            videos: true,
            votes: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
    });

    const stats = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      totalPoints: user.totalPoints,
      videosCount: user._count.videos,
      votesCount: user._count.votes,
      createdAt: user.createdAt,
    }));

    res.json({ users: stats });
  } catch (error) {
    next(error);
  }
});

// Estadísticas de videos por período
router.get('/videos/stats', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate, round, year } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    if (round) {
      where.round = Number(round);
    }
    if (year) {
      where.year = Number(year);
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ videos });
  } catch (error) {
    next(error);
  }
});

// ==================== GESTIÓN DE PREMIOS ====================

// Listar todos los premios
router.get('/awards', authenticate, isAdmin, async (req, res, next) => {
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
        { position: 'asc' },
      ],
    });

    res.json({ awards });
  } catch (error) {
    next(error);
  }
});

// Modificar premio
router.put(
  '/awards/:id',
  authenticate,
  isAdmin,
  [
    body('prize').optional().isString(),
    body('prizeValue').optional().isFloat({ min: 0 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { prize, prizeValue } = req.body;

      const updateData: any = {};
      if (prize !== undefined) updateData.prize = prize;
      if (prizeValue !== undefined) updateData.prizeValue = Number(prizeValue);

      const award = await prisma.award.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      res.json({ award });
    } catch (error) {
      next(error);
    }
  }
);

// Calcular premios anuales
router.post(
  '/awards/calculate',
  authenticate,
  isAdmin,
  [
    body('year').isInt({ min: 2020 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { year } = req.body;
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

// ==================== GESTIÓN DE JURADOS ====================

// Listar miembros del jurado
router.get('/jury', authenticate, isAdmin, async (req, res, next) => {
  try {
    const juryMembers = await prisma.juryMember.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    res.json({ jury: juryMembers });
  } catch (error) {
    next(error);
  }
});

// Agregar miembro del jurado
router.post(
  '/jury',
  authenticate,
  isAdmin,
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('role').optional().isString(),
    body('image').optional().isString(),
    body('bio').optional().isString(),
    body('userId').optional().isString(),
    body('order').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, role, image, bio, userId, order } = req.body;

      const juryMember = await prisma.juryMember.create({
        data: {
          name,
          role: role || null,
          image: image || null,
          bio: bio || null,
          userId: userId || null,
          order: order || 0,
        },
      });

      res.status(201).json({ juryMember });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== REPORTES DE INGRESOS ====================

// Reportes de ingresos
router.get('/reports/revenue', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: 'completed',
    };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Ingresos por categoría
    const revenueByCategory: { [category: string]: number } = {};
    for (const payment of payments) {
      const categories = JSON.parse(payment.categories || '[]');
      for (const category of categories) {
        if (!revenueByCategory[category]) {
          revenueByCategory[category] = 0;
        }
        revenueByCategory[category] += payment.amount / categories.length;
      }
    }

    res.json({
      totalRevenue,
      payments,
      revenueByCategory,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
