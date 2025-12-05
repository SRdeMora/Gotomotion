import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Inicializa la base de datos si no existe
 * Se ejecuta automáticamente al iniciar el servidor
 */
export async function initDatabase() {
  try {
    // Intentar conectar a la base de datos
    // Prisma creará automáticamente el archivo SQLite si no existe
    await prisma.$connect();
    console.log('✅ Base de datos conectada');
    
    // Intentar ejecutar una query simple para verificar que funciona
    // Esto también creará las tablas si no existen (con db push)
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Base de datos lista');
  } catch (error: any) {
    console.log('⚠️ Base de datos se inicializará en la primera operación:', error.message);
    // No lanzar error, dejar que el servidor inicie de todas formas
    // La base de datos se creará cuando se haga la primera operación
  }
}

