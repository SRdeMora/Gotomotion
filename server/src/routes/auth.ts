import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['VOTER', 'PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name, password, role } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      // En SQLite, teamMembers es String (JSON), en PostgreSQL es array
      const userData: any = {
        email,
        name,
        password: hashedPassword,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
        totalPoints: 0,
      };
      
      // teamMembers: en SQLite es String, en PostgreSQL es array
      // Prisma manejará la conversión automáticamente según el schema
      if (role === 'PARTICIPANT_TEAM') {
        userData.teamMembers = '[]'; // SQLite espera String
      }
      
      const user = await prisma.user.create({
        data: userData,
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

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        user,
        token,
      });
    } catch (error: any) {
      console.error('❌ [AUTH] Error en registro:', error);
      console.error('❌ [AUTH] Stack:', error?.stack);
      console.error('❌ [AUTH] Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Asegurar que siempre se devuelva un error válido
      if (!res.headersSent) {
        if (error.name === 'PrismaClientKnownRequestError') {
          if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El email ya está registrado' });
          }
          return res.status(500).json({ 
            error: 'Error en la base de datos',
            message: 'No se pudo crear el usuario. Por favor, intenta más tarde.'
          });
        }
        return res.status(500).json({ 
          error: 'Error al registrar usuario',
          message: error.message || 'Ha ocurrido un error inesperado. Por favor, intenta más tarde.'
        });
      }
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      console.error('❌ [AUTH] Error en registro:', error);
      console.error('❌ [AUTH] Stack:', error?.stack);
      next(error);
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        sector: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;

