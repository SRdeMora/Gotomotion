#!/usr/bin/env node

/**
 * Script para volver a PostgreSQL (producción)
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const backupPath = path.join(__dirname, '../prisma/schema.postgresql.prisma.backup');

console.log('🔄 Volviendo a PostgreSQL...\n');

// Verificar que existe el backup
if (!fs.existsSync(backupPath)) {
  console.error('❌ Error: No se encontró el backup de PostgreSQL');
  console.error('   El schema.prisma original debería estar en schema.postgresql.prisma.backup');
  console.error('   Si no existe, necesitas restaurar el schema original manualmente.');
  process.exit(1);
}

// Restaurar schema de PostgreSQL
console.log('📝 Restaurando schema de PostgreSQL...');
fs.copyFileSync(backupPath, schemaPath);
console.log('✅ Schema de PostgreSQL restaurado\n');

console.log('📋 Próximos pasos:');
console.log('   1. Configura DATABASE_URL en .env');
console.log('   2. Ejecuta: npm run db:push');
console.log('   3. Reinicia el servidor: npm run dev\n');

