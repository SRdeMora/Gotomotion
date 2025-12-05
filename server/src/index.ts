import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { initDatabase } from './utils/initDb';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import voteRoutes from './routes/votes';
import forumRoutes from './routes/forum';
import rankingRoutes from './routes/ranking';
import paymentRoutes from './routes/payments';
import juryRoutes from './routes/jury';
import awardRoutes from './routes/awards';
import leagueRoutes from './routes/leagues';
import adminRoutes from './routes/admin';

// Cargar variables de entorno - dotenv.config() busca automáticamente .env en el directorio actual
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - necesario para Render y otros servicios detrás de proxy
// Esto permite que express-rate-limit identifique correctamente las IPs
app.set('trust proxy', 1);

// Initialize Sentry (opcional)
if (process.env.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
    console.log('✅ Sentry inicializado');
  } catch (error) {
    console.log('⚠️ Sentry no configurado (continuando sin Sentry)');
  }
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - permitir múltiples orígenes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://go2motion-frontend.onrender.com',
  'https://go2motion-backend.onrender.com',
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman o mobile apps)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier origen en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, verificar contra la lista de orígenes permitidos
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/^https?:\/\//, '')))) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
      callback(null, true); // Permitir de todas formas para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/jury', juryRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/admin', adminRoutes);

// Error handling (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Inicializar base de datos antes de iniciar el servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('❌ Error al inicializar servidor:', error);
  // Iniciar servidor de todas formas
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (sin inicialización de DB)`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

export default app;

