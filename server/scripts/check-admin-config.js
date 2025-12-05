#!/usr/bin/env node

/**
 * Script para verificar y configurar ADMIN_EMAILS
 * Uso: node scripts/check-admin-config.js [email]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '../.env');

function readEnvFile() {
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

function writeEnvFile(env) {
  const lines = [];
  
  // Mantener comentarios y líneas existentes si es posible
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      if (line.trim().startsWith('#')) {
        lines.push(line);
      }
    });
  }
  
  // Escribir variables de entorno
  Object.entries(env).forEach(([key, value]) => {
    lines.push(`${key}=${value}`);
  });
  
  fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf-8');
}

function checkAdminConfig(email) {
  const env = readEnvFile();
  
  if (!env.ADMIN_EMAILS || env.ADMIN_EMAILS.trim() === '') {
    console.log('❌ ADMIN_EMAILS no está configurado\n');
    
    if (email) {
      env.ADMIN_EMAILS = email;
      writeEnvFile(env);
      console.log(`✅ ADMIN_EMAILS configurado como: ${email}`);
      console.log('\n⚠️  IMPORTANTE: Reinicia el servidor backend para que los cambios surtan efecto.');
      console.log('   Ejecuta: npm run dev\n');
      return true;
    } else {
      console.log('Para configurarlo, ejecuta:');
      console.log(`  node scripts/check-admin-config.js tu-email@ejemplo.com\n`);
      return false;
    }
  } else {
    const emails = env.ADMIN_EMAILS.split(',').map(e => e.trim());
    console.log('✅ ADMIN_EMAILS está configurado:');
    emails.forEach(e => console.log(`   - ${e}`));
    console.log('');
    return true;
  }
}

// Ejecutar
const email = process.argv[2];

if (email && !email.includes('@')) {
  console.error('❌ Error: El email debe ser válido (contener @)');
  process.exit(1);
}

const isConfigured = checkAdminConfig(email);

if (!isConfigured) {
  process.exit(1);
}

