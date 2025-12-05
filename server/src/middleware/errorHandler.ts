import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error to Sentry in production
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  console.error('❌ Error:', err);
  console.error('❌ Stack:', err.stack);
  
  // Log detallado en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error completo:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError' || err.name === 'PrismaClientInitializationError') {
    const isConnectionError = err.message?.includes('Can\'t reach database server') || 
                              err.message?.includes('P1001') ||
                              err.message?.includes('connection') ||
                              err.message?.includes('ECONNREFUSED');
    
    if (isConnectionError) {
      res.status(503).json({
        error: 'Base de datos no disponible',
        message: 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
      return;
    }
    
    res.status(400).json({
      error: 'Error en la base de datos',
      message: 'Ha ocurrido un error al procesar tu solicitud. Por favor, intenta más tarde.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
    return;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    // Limpiar mensajes de validación para hacerlos más amigables
    let friendlyMessage = err.message
      .replace(/ValidationError:/g, '')
      .replace(/at\s+.*/g, '')
      .trim();
    
    if (!friendlyMessage || friendlyMessage.length > 200) {
      friendlyMessage = 'Los datos proporcionados no son válidos. Por favor, verifica la información e intenta nuevamente.';
    }
    
    res.status(400).json({
      error: 'Error de validación',
      message: friendlyMessage,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token inválido o expirado',
    });
    return;
  }

  // Cloudinary errors
  if (err.message?.includes('Cloudinary') || err.message?.includes('cloudinary')) {
    res.status(500).json({
      error: 'Error al subir archivo',
      message: 'Error al subir el archivo. Por favor, verifica que el archivo sea válido e intenta nuevamente.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      error: 'Error al procesar el archivo',
      message: err.message || 'El archivo es demasiado grande o tiene un formato no válido',
    });
    return;
  }

  // Default error - siempre devolver mensaje amigable
  const friendlyMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Ha ocurrido un error inesperado. Por favor, intenta más tarde.';
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: friendlyMessage,
    // Solo incluir detalles técnicos en desarrollo
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

