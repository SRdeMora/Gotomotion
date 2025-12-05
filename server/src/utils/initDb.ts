import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Inicializa la base de datos si no existe
 * Se ejecuta automáticamente al iniciar el servidor
 */
export async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');
    
    // Intentar conectar a la base de datos
    // Prisma creará automáticamente el archivo SQLite si no existe
    await prisma.$connect();
    console.log('✅ Base de datos conectada');
    
    // Verificar que la base de datos funciona con una operación simple
    // Usar count() que funciona tanto en SQLite como PostgreSQL
    await prisma.user.count();
    console.log('✅ Base de datos lista y funcionando');
    
    // Verificar que las tablas existan creando una liga por defecto si no hay ninguna
    try {
      const leagueCount = await prisma.league.count();
      if (leagueCount === 0) {
        const currentYear = new Date().getFullYear();
        await prisma.league.create({
          data: {
            round: 1,
            year: currentYear,
            name: 'Liga Inicial',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            juryEndDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
            isActive: true,
          },
        });
        console.log('✅ Liga por defecto creada');
      }
    } catch (error: any) {
      console.log('⚠️ No se pudo crear liga por defecto (puede que ya exista):', error.message);
    }
  } catch (error: any) {
    console.error('❌ Error al inicializar base de datos:', error.message);
    console.error('❌ Stack:', error.stack);
    console.log('⚠️ El servidor continuará, pero algunas funciones pueden no funcionar');
    // No lanzar error, dejar que el servidor inicie de todas formas
  }
}

