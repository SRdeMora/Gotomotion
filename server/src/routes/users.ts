import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB para avatares
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// Calcular y actualizar puntos anuales de un usuario
const updateUserTotalPoints = async (userId: string, year: number) => {
  const videos = await prisma.video.findMany({
    where: {
      authorId: userId,
      year,
    },
    select: {
      totalPoints: true,
    },
  });

  const totalPoints = videos.reduce((sum, video) => sum + video.totalPoints, 0);

  await prisma.user.update({
    where: { id: userId },
    data: { totalPoints },
  });

  return totalPoints;
};

// Get user profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        sector: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Upload avatar
router.post(
  '/:id/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: any, res, next) => {
    try {
      // Only allow users to update their own profile
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo de imagen' });
      }

      // Validar que el archivo tenga buffer
      if (!req.file.buffer) {
        console.error('❌ [AVATAR] El archivo no tiene buffer:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
        return res.status(400).json({ 
          error: 'Error al procesar el archivo',
          message: 'El archivo no se recibió correctamente. Verifica que el tamaño no exceda 5MB.',
        });
      }

      console.log('📤 [AVATAR] Subiendo imagen a Cloudinary...', {
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      });

      // Subir imagen a Cloudinary
      let result;
      try {
        result = await uploadToCloudinary(req.file, 'go2motion/avatars');
        console.log('✅ [AVATAR] Imagen subida correctamente:', result.url);
      } catch (error: any) {
        console.error('❌ [AVATAR] Error al subir imagen:', error);
        return res.status(500).json({
          error: 'Error al subir la imagen',
          message: error.message || 'No se pudo subir la imagen. Verifica la configuración de Cloudinary.',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }

      // Actualizar avatar del usuario
      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: { avatar: result.url },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          sector: true,
          totalPoints: true,
          teamMembers: true,
          socials: true,
        },
      });

      // Parsear campos JSON para SQLite
      const user = {
        ...updatedUser,
        teamMembers: typeof updatedUser.teamMembers === 'string' 
          ? JSON.parse(updatedUser.teamMembers || '[]')
          : updatedUser.teamMembers,
        socials: typeof updatedUser.socials === 'string'
          ? (updatedUser.socials ? JSON.parse(updatedUser.socials) : null)
          : updatedUser.socials,
      };

      res.json({ user, message: 'Avatar actualizado correctamente' });
    } catch (error) {
      next(error);
    }
  }
);

// Update user role (upgrade from VOTER to PARTICIPANT)
router.put(
  '/:id/role',
  authenticate,
  [
    body('role').isIn(['PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM']),
  ],
  async (req: any, res, next) => {
    try {
      // Only allow users to update their own role
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;

      // Only allow upgrading from VOTER to PARTICIPANT
      const currentUser = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { role: true },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Solo permitir cambiar de VOTER a PARTICIPANT
      if (currentUser.role !== 'VOTER') {
        return res.status(400).json({ 
          error: 'Solo puedes cambiar tu rol si eres votante',
          message: 'Ya eres participante. No puedes cambiar tu rol nuevamente.',
        });
      }

      const updateData: any = { role };
      
      // Si es equipo, inicializar teamMembers
      if (role === 'PARTICIPANT_TEAM') {
        updateData.teamMembers = '[]'; // SQLite espera String
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          sector: true,
          totalPoints: true,
          teamMembers: true,
          socials: true,
        },
      });

      // Parsear campos JSON para SQLite
      const user = {
        ...updatedUser,
        teamMembers: typeof updatedUser.teamMembers === 'string' 
          ? JSON.parse(updatedUser.teamMembers || '[]')
          : updatedUser.teamMembers,
        socials: typeof updatedUser.socials === 'string'
          ? (updatedUser.socials ? JSON.parse(updatedUser.socials) : null)
          : updatedUser.socials,
      };

      res.json({ user, message: 'Rol actualizado correctamente' });
    } catch (error) {
      next(error);
    }
  }
);

// Update user profile
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('sector').optional().trim(),
    body('teamMembers').optional().isArray(),
    body('socials').optional().isObject(),
  ],
  async (req: any, res, next) => {
    try {
      // Only allow users to update their own profile
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, bio, sector, teamMembers, socials } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (sector !== undefined) updateData.sector = sector;
      
      // En SQLite, teamMembers es String (JSON), en PostgreSQL es array
      if (teamMembers !== undefined) {
        updateData.teamMembers = Array.isArray(teamMembers) 
          ? JSON.stringify(teamMembers) 
          : teamMembers;
      }
      
      // En SQLite, socials es String (JSON), en PostgreSQL es Json
      if (socials !== undefined) {
        updateData.socials = typeof socials === 'object' && socials !== null
          ? JSON.stringify(socials)
          : socials;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          sector: true,
          totalPoints: true,
          teamMembers: true,
          socials: true,
        },
      });

      // Parsear campos JSON para SQLite (en PostgreSQL ya vienen como objetos)
      const user = {
        ...updatedUser,
        teamMembers: typeof updatedUser.teamMembers === 'string' 
          ? JSON.parse(updatedUser.teamMembers || '[]')
          : updatedUser.teamMembers,
        socials: typeof updatedUser.socials === 'string'
          ? (updatedUser.socials ? JSON.parse(updatedUser.socials) : null)
          : updatedUser.socials,
      };

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
);

// Obtener puntos anuales del usuario
router.get('/:id/points', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    const currentYear = year ? Number(year) : new Date().getFullYear();

    // Calcular puntos del año
    const totalPoints = await updateUserTotalPoints(id, currentYear);

    // Obtener puntos por liga
    const videos = await prisma.video.findMany({
      where: {
        authorId: id,
        year: currentYear,
      },
      select: {
        round: true,
        totalPoints: true,
        categories: true,
      },
    });

    const pointsByRound: { [round: number]: number } = {};
    for (const video of videos) {
      if (!pointsByRound[video.round]) {
        pointsByRound[video.round] = 0;
      }
      pointsByRound[video.round] += video.totalPoints;
    }

    res.json({
      totalPoints,
      year: currentYear,
      pointsByRound,
      videos: videos.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

