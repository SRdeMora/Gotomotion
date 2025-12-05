#!/bin/bash

# Script post-deploy para Render - Backend
# Este script se ejecuta después del despliegue para inicializar la base de datos

set -e

echo "🔧 Ejecutando tareas post-deploy..."

cd server

echo "📊 Aplicando esquema de base de datos..."
npm run db:push || echo "⚠️ Esquema ya aplicado o error (continuando...)"

echo "✅ Post-deploy completado!"

