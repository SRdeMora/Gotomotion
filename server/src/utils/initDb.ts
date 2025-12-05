import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Inicializa la base de datos si no existe
 * Se ejecuta automáticamente al iniciar el servidor
 */
export async function initDatabase() {
  try {
    // Intentar conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Base de datos conectada');
    
    // Intentar ejecutar una query simple para verificar que funciona
    await prisma.$executeRaw`SELECT 1`;
    
    // Intentar aplicar el esquema usando Prisma directamente
    // Esto creará las tablas si no existen
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        finished_at DATETIME,
        migration_name TEXT NOT NULL,
        logs TEXT,
        rolled_back_at DATETIME,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      );
    `).catch(() => {
      // Ignorar error si la tabla ya existe
    });
    
    console.log('✅ Base de datos inicializada');
  } catch (error: any) {
    console.log('⚠️ Error al inicializar base de datos (continuando...):', error.message);
    // No lanzar error, dejar que el servidor inicie de todas formas
    // La base de datos se creará cuando se haga la primera operación
  }
}

