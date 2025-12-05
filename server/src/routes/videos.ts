import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { body, validationResult, query } from 'express-validator';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Get all videos with filters
router.get(
  '/',
  [
    query('category').optional().isString(),
    query('search').optional().isString(),
    query('round').optional().isInt(),
    query('year').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        category,
        search,
        round,
        year,
        page = 1,
        limit = 20,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (category) {
        // Para SQLite: categories es String, usar contains
        // Para PostgreSQL: categories es array, usar has
        // Prisma manejará esto automáticamente según el schema
        where.categories = { contains: category as string };
      }
      if (round) {
        where.round = Number(round);
      }
      if (year) {
        where.year = Number(year);
      }
      if (search) {
        const searchTerm = search as string;
        
        // Detectar si estamos usando SQLite basado en DATABASE_URL
        // SQLite no soporta mode: 'insensitive' en Prisma
        const isSQLite = !process.env.DATABASE_URL || 
                         process.env.DATABASE_URL.includes('sqlite') || 
                         process.env.DATABASE_URL.includes('file:');
        
        if (isSQLite) {
          // SQLite: NO usar relaciones anidadas (author.name) porque SQLite no las soporta bien
          // Solo buscar por título aquí, luego agregaremos búsqueda por autor
          where.OR = [
            { title: { contains: searchTerm } },
          ];
        } else {
          // PostgreSQL: usar mode insensitive para búsqueda case-insensitive
          where.OR = [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { author: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ];
        }
      }

      // Si hay búsqueda y es SQLite, necesitamos buscar también por nombre de autor
      // SQLite no soporta bien las relaciones anidadas en where, así que buscamos usuarios primero
      let finalWhere = { ...where };
      
      if (search && (!process.env.DATABASE_URL || 
                     process.env.DATABASE_URL.includes('sqlite') || 
                     process.env.DATABASE_URL.includes('file:'))) {
        // Buscar usuarios que coincidan con el término de búsqueda
        try {
          const matchingUsers = await prisma.user.findMany({
            where: {
              name: { contains: search as string },
            },
            select: { id: true },
          });
          const authorIds = matchingUsers.map(u => u.id);
          
          // Agregar búsqueda por authorId si encontramos usuarios
          if (authorIds.length > 0) {
            if (finalWhere.OR && Array.isArray(finalWhere.OR)) {
              // Si ya existe OR, agregar la condición de authorId
              finalWhere.OR.push({ authorId: { in: authorIds } });
            } else {
              // Si no existe OR, crear uno nuevo con ambas condiciones
              finalWhere.OR = [
                { title: { contains: search as string } },
                { authorId: { in: authorIds } },
              ];
            }
          }
        } catch (error) {
          console.error('[VIDEOS] Error al buscar usuarios:', error);
          // Continuar sin búsqueda por autor si falla, solo buscar por título
          if (!finalWhere.OR) {
            finalWhere.OR = [{ title: { contains: search as string } }];
          }
        }
      }

      const [videos, total] = await Promise.all([
        prisma.video.findMany({
          where: finalWhere,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: { votes: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.video.count({ where: finalWhere }),
      ]);

      // Asegurar que siempre devolvamos un array válido
      const videosList = videos || [];
      
      // Asegurar que siempre se devuelva JSON válido
      try {
        res.json({
          videos: videosList.map((v) => {
          // Parsear categories si viene como string (SQLite)
          const categories = typeof v.categories === 'string'
            ? JSON.parse(v.categories || '[]')
            : v.categories || [];

          return {
            ...v,
            categories,
            votes: v._count.votes,
            authorId: v.authorId, // Incluir authorId para filtrado
            authorName: v.author?.name || '', // Incluir nombre del autor
          };
        }),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        });
      } catch (jsonError: any) {
        console.error('[VIDEOS] Error al serializar respuesta JSON:', jsonError);
        // Si falla la serialización, devolver respuesta básica
        res.status(500).json({
          error: 'Error al procesar la respuesta',
          videos: [],
          pagination: {
            page: Number(page) || 1,
            limit: Number(limit) || 20,
            total: 0,
            pages: 0,
          }
        });
      }
    } catch (error: any) {
      console.error('[VIDEOS] Error al obtener videos:', error);
      console.error('[VIDEOS] Stack:', error?.stack);
      
      // Asegurar que siempre se devuelva una respuesta válida
      if (!res.headersSent) {
        if (error.name === 'PrismaClientKnownRequestError' || error.name === 'PrismaClientInitializationError') {
          return res.status(503).json({ 
            error: 'Base de datos no disponible',
            videos: [],
            pagination: {
              page: Number(req.query.page) || 1,
              limit: Number(req.query.limit) || 20,
              total: 0,
              pages: 0,
            }
          });
        }
        return res.status(500).json({ 
          error: 'Error al obtener videos',
          videos: [],
          pagination: {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            total: 0,
            pages: 0,
          }
        });
      }
      next(error);
    }
  }
);

// Get single video
router.get('/:id', async (req, res, next) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Increment views
    await prisma.video.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    // Parsear categories si viene como string (SQLite)
    const categories = typeof video.categories === 'string'
      ? JSON.parse(video.categories || '[]')
      : video.categories || [];

    res.json({
      ...video,
      categories,
      votes: video._count.votes,
      // Asegurar que videoUrl tenga un valor (usar videoLink si videoUrl está vacío)
      videoUrl: video.videoUrl || video.videoLink || '',
    });
  } catch (error) {
    next(error);
  }
});

// Create video (only for participants) - Requiere pago verificado
router.post(
  '/',
  authenticate,
  authorize('PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('materialsUsed').optional().trim(),
    body('categories').custom((value) => {
      // FormData envía JSON como string, necesitamos parsearlo
      let parsed;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          throw new Error('categories debe ser un array válido');
        }
      } else {
        parsed = value;
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('categories debe ser un array no vacío');
      }
      return true;
    }),
    body('round').optional().isInt({ min: 1 }),
    body('year').optional().isInt({ min: 2020 }),
    body('videoLink').optional().custom((value) => {
      if (!value) return true; // Es opcional
      // Validar que sea una URL válida
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('videoLink debe ser una URL válida');
      }
    }),
    body('paymentId').optional().isString(), // ID del pago verificado (opcional para desarrollo/demo)
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('[VIDEO] Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let { title, description, materialsUsed, categories, round, year, videoLink, paymentId } = req.body;

      // Parsear categories si viene como string (FormData)
      if (typeof categories === 'string') {
        try {
          categories = JSON.parse(categories);
        } catch (error) {
          console.error('[VIDEO] Error al parsear categories:', error);
          return res.status(400).json({ error: 'Formato de categorías inválido' });
        }
      }

      console.log('[VIDEO] Datos recibidos:', {
        title,
        categories,
        paymentId: paymentId || 'NO_PROVIDED (modo demo)',
        hasVideoLink: !!videoLink,
        hasVideoFile: !!files.video,
        hasThumbnail: !!files.thumbnail,
      });

      // Verificar pago solo si se proporciona paymentId (opcional para desarrollo/demo)
      let payment = null;
      if (paymentId) {
        payment = await prisma.payment.findUnique({
          where: { id: paymentId },
        });

        if (!payment) {
          return res.status(404).json({ error: 'Pago no encontrado' });
        }

        if (payment.userId !== req.user!.id) {
          return res.status(403).json({ error: 'Este pago no pertenece a tu cuenta' });
        }

        if (payment.status !== 'completed') {
          return res.status(400).json({ error: 'El pago no ha sido completado' });
        }

        // Verificar que las categorías coinciden con las pagadas
        // En SQLite: categories es String (JSON), en PostgreSQL es array
        const paidCategories = typeof payment.categories === 'string'
          ? JSON.parse(payment.categories || '[]')
          : payment.categories;
        
        // categories ya está parseado como array
        const videoCategories = Array.isArray(categories) ? categories : [categories];
        
        console.log('[VIDEO] Categorías del video:', videoCategories);
        console.log('[VIDEO] Categorías pagadas:', paidCategories);
        
        const categoriesMatch = videoCategories.every(cat => paidCategories.includes(cat));
        if (!categoriesMatch) {
          return res.status(400).json({ error: 'Las categorías no coinciden con las pagadas' });
        }
      } else {
        console.log('[VIDEO] Modo demo: subiendo video sin verificación de pago');
      }
      
      // Usar categories parseado para el resto del código
      const videoCategories = Array.isArray(categories) ? categories : [categories];

      // Verificar que hay thumbnail (requerido)
      if (!files.thumbnail) {
        return res.status(400).json({ error: 'Se requiere thumbnail' });
      }

      let videoUrl = '';
      let thumbnailUrl = '';

      // Si hay link de video, usarlo; si no, subir archivo
      if (videoLink) {
        videoUrl = videoLink;
        console.log('[VIDEO] Usando link externo:', videoLink);
      } else if (files.video) {
        console.log('[VIDEO] Subiendo archivo de video a Cloudinary...');
        try {
          const videoResult = await uploadToCloudinary(files.video[0], 'go2motion/videos');
          videoUrl = videoResult.url;
          console.log('[VIDEO] Video subido correctamente:', videoUrl);
        } catch (error: any) {
          console.error('[VIDEO] Error al subir video:', error);
          return res.status(500).json({
            error: 'Error al subir el video',
            message: error.message || 'No se pudo subir el archivo de video. Verifica la configuración de Cloudinary o usa un link externo.',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          });
        }
      } else {
        return res.status(400).json({ error: 'Se requiere video (archivo o link)' });
      }

      // Subir thumbnail
      console.log('[VIDEO] Subiendo thumbnail a Cloudinary...');
      try {
        const thumbnailResult = await uploadToCloudinary(files.thumbnail[0], 'go2motion/thumbnails');
        thumbnailUrl = thumbnailResult.url;
        console.log('[VIDEO] Thumbnail subido correctamente:', thumbnailUrl);
      } catch (error: any) {
        console.error('[VIDEO] Error al subir thumbnail:', error);
        return res.status(500).json({
          error: 'Error al subir la imagen de portada',
          message: error.message || 'No se pudo subir el thumbnail. Verifica la configuración de Cloudinary.',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }

      // Verificar que la liga está abierta
      const currentRound = round ? Number(round) : 1;
      const currentYear = year ? Number(year) : new Date().getFullYear();
      
      // League usa clave única compuesta (round, year)
      const league = await prisma.league.findUnique({
        where: {
          round_year: {
            round: currentRound,
            year: currentYear,
          },
        },
      });

      if (league && !league.isActive) {
        return res.status(400).json({ error: 'Esta liga está cerrada' });
      }

      console.log('[VIDEO] Creando registro de video en la base de datos...');
      
      const video = await prisma.video.create({
        data: {
          title,
          description,
          materialsUsed,
          thumbnail: thumbnailUrl,
          videoUrl,
          videoLink: videoLink || null,
          // En SQLite: guardar como JSON string, en PostgreSQL como array
          categories: typeof videoCategories === 'string' ? videoCategories : JSON.stringify(videoCategories),
          round: currentRound,
          year: currentYear,
          authorId: req.user!.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      console.log('[VIDEO] Video creado exitosamente:', video.id);

      // Asociar el pago con el video
      await prisma.payment.update({
        where: { id: paymentId },
        data: { videoId: video.id },
      });

      console.log('[VIDEO] Pago asociado con el video');

      res.status(201).json({ video });
    } catch (error: any) {
      console.error('[VIDEO] Error completo al crear video:', error);
      console.error('[VIDEO] Stack:', error.stack);
      console.error('[VIDEO] Error detallado:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      next(error);
    }
  }
);

// Update video (only owner)
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const video = await prisma.video.findUnique({
        where: { id: req.params.id },
      });

      if (!video) {
        return res.status(404).json({ error: 'Video no encontrado' });
      }

      if (video.authorId !== req.user!.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const updatedVideo = await prisma.video.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      res.json({ video: updatedVideo });
    } catch (error) {
      next(error);
    }
  }
);

// Delete video (only owner)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    if (video.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await prisma.video.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Video eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;

