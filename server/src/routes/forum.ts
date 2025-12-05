import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all topics
router.get(
  '/topics',
  [
    query('category').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const { category, page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (category) {
        where.category = category;
      }

      const [topics, total] = await Promise.all([
        prisma.forumTopic.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: { replies: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.forumTopic.count({ where }),
      ]);

      res.json({
        topics: topics.map((t) => ({
          ...t,
          replies: t._count.replies,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single topic with replies
router.get('/topics/:id', async (req, res, next) => {
  try {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    // Increment views
    await prisma.forumTopic.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    res.json({ topic });
  } catch (error) {
    next(error);
  }
});

// Create topic (only participants)
router.post(
  '/topics',
  authenticate,
  authorize('PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM'),
  [
    body('title').trim().isLength({ min: 5, max: 200 }),
    body('content').trim().isLength({ min: 10, max: 5000 }),
    body('category').isIn(['GENERAL', 'TECNICA', 'PROMOCION', 'NORMATIVA', 'SHOWCASE']),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, category } = req.body;

      const topic = await prisma.forumTopic.create({
        data: {
          title,
          content,
          category,
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

      res.status(201).json({ topic });
    } catch (error) {
      next(error);
    }
  }
);

// Create reply
router.post(
  '/topics/:topicId/replies',
  authenticate,
  authorize('PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM'),
  [body('content').trim().isLength({ min: 5, max: 2000 })],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { topicId } = req.params;
      const { content } = req.body;

      // Check if topic exists
      const topic = await prisma.forumTopic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }

      const reply = await prisma.forumReply.create({
        data: {
          content,
          topicId,
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

      res.status(201).json({ reply });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

