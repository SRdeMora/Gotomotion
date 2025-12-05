import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Inicializa la base de datos si no existe
 * Se ejecuta automáticamente al iniciar el servidor
 */
export async function initDatabase() {
  try {
    // Intentar conectar y crear las tablas si no existen
    await prisma.$connect();
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Base de datos conectada');
    
    // Intentar aplicar el esquema (solo crea tablas si no existen)
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        cwd: process.cwd() 
      });
      console.log('✅ Esquema de base de datos aplicado');
    } catch (error) {
      console.log('⚠️ Esquema ya aplicado o error (continuando...)');
    }
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    // No lanzar error, dejar que el servidor inicie de todas formas
  }
}

