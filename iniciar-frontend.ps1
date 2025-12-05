# Script para iniciar el frontend con verificación
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Verificar que vite está instalado
$viteInstalled = npm list vite 2>&1 | Select-String "vite@"
if (-not $viteInstalled) {
    Write-Host "⚠️  Vite no encontrado. Instalando..." -ForegroundColor Yellow
    npm install vite @vitejs/plugin-react --save-dev
    Write-Host ""
}

Write-Host "✅ Verificaciones completadas" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Iniciando servidor en http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
npm run dev

