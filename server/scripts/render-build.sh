#!/bin/bash

# Script de build para Render
# Este script se ejecuta automáticamente durante el build en Render

echo "🔨 Iniciando build para Render..."

# Cambiar a PostgreSQL
echo "📝 Cambiando a PostgreSQL..."
npm run db:switch-postgresql

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npm run db:generate

# Compilar TypeScript
echo "⚙️ Compilando TypeScript..."
npm run build

echo "✅ Build completado!"

