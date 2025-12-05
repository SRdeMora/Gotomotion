#!/usr/bin/env node

/**
 * Script para cambiar temporalmente a SQLite para desarrollo local
 * NO usar en producción
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const sqliteSchemaPath = path.join(__dirname, '../prisma/schema.sqlite.prisma');
const backupPath = path.join(__dirname, '../prisma/schema.postgresql.prisma.backup');

console.log('🔄 Cambiando a SQLite para desarrollo...\n');

// Verificar que existe el schema de SQLite
if (!fs.existsSync(sqliteSchemaPath)) {
  console.error('❌ Error: No se encontró schema.sqlite.prisma');
  process.exit(1);
}

// Hacer backup del schema de PostgreSQL si no existe
if (!fs.existsSync(backupPath) && fs.existsSync(schemaPath)) {
  console.log('📦 Creando backup del schema de PostgreSQL...');
  fs.copyFileSync(schemaPath, backupPath);
  console.log('✅ Backup creado en schema.postgresql.prisma.backup\n');
}

// Copiar schema de SQLite
console.log('📝 Aplicando schema de SQLite...');
fs.copyFileSync(sqliteSchemaPath, schemaPath);
console.log('✅ Schema de SQLite aplicado\n');

console.log('📋 Próximos pasos:');
console.log('   1. Ejecuta: npm run db:push');
console.log('   2. Reinicia el servidor: npm run dev');
console.log('\n⚠️  Recuerda: Este cambio es solo para desarrollo local');
console.log('   Para volver a PostgreSQL, ejecuta: npm run switch-to-postgresql\n');

