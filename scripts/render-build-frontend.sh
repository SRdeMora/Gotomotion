#!/bin/bash

# Script de build automático para Render - Frontend
# Este script se ejecuta automáticamente durante el despliegue

set -e  # Salir si hay algún error

echo "🚀 Iniciando build del frontend para Render..."

echo "📦 Instalando dependencias..."
npm install

echo "🏗️ Construyendo aplicación..."
npm run build

echo "✅ Build del frontend completado!"
echo "📁 Archivos generados en: ./dist"

