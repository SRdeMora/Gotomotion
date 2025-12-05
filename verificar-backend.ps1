# Script para verificar que el backend está corriendo
Write-Host "🔍 Verificando conexión con el backend..." -ForegroundColor Cyan
Write-Host ""

# Probar conexión al backend
$backendUrl = "http://localhost:3001/health"
Write-Host "Probando: $backendUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $backendUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend está corriendo correctamente!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Respuesta: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ No se puede conectar al backend en http://localhost:3001" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  1. El backend no está corriendo" -ForegroundColor White
    Write-Host "  2. El backend está corriendo en otro puerto" -ForegroundColor White
    Write-Host "  3. Hay un firewall bloqueando la conexión" -ForegroundColor White
    Write-Host ""
    Write-Host "Solución:" -ForegroundColor Yellow
    Write-Host "  1. Abre una terminal y ejecuta: cd server && npm run dev" -ForegroundColor White
    Write-Host "  2. Verifica que ves: 'Server running on port 3001'" -ForegroundColor White
    Write-Host "  3. Verifica server/.env tiene: PORT=3001" -ForegroundColor White
}

Write-Host ""
Write-Host "Verificando procesos en el puerto 3001..." -ForegroundColor Cyan
$port3001 = netstat -ano | findstr :3001
if ($port3001) {
    Write-Host "✅ Hay un proceso escuchando en el puerto 3001" -ForegroundColor Green
    Write-Host $port3001 -ForegroundColor Gray
} else {
    Write-Host "⚠️  No hay ningún proceso escuchando en el puerto 3001" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Verificando procesos en el puerto 5000..." -ForegroundColor Cyan
$port5000 = netstat -ano | findstr :5000
if ($port5000) {
    Write-Host "⚠️  Hay un proceso en el puerto 5000 (puede ser el backend anterior)" -ForegroundColor Yellow
    Write-Host $port5000 -ForegroundColor Gray
}

