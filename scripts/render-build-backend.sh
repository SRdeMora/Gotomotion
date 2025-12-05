#!/bin/bash

# Script de build automático para Render - Backend
# Este script se ejecuta automáticamente durante el despliegue

set -e  # Salir si hay algún error

echo "🚀 Iniciando build del backend para Render..."

# Ir al directorio del servidor
cd server

echo "📦 Instalando dependencias (incluyendo devDependencies para TypeScript)..."
npm install --include=dev

echo "🔄 Cambiando a SQLite para demo..."
if npm run db:switch-sqlite; then
  echo "✅ Cambiado a SQLite"
else
  echo "⚠️ Error al cambiar a SQLite, continuando..."
fi

echo "🔧 Generando cliente de Prisma..."
npm run db:generate

echo "⚙️ Compilando TypeScript..."
npm run build

echo "✅ Build del backend completado!"

