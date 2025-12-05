# 🔧 Solución: Error CORS y Proxy de Vite

## 🔍 Problema

El error indica que estás intentando hacer fetch directamente a `http://localhost:3001/auth/login` pero:
1. El puerto 3001 está sirviendo el FRONTEND (Vite), no el backend
2. Estás usando URLs absolutas en lugar de rutas relativas
3. El proxy de Vite no está funcionando porque no estás usando rutas relativas

## ✅ Solución Aplicada

He cambiado el código para usar **rutas relativas** (`/api/...`) en lugar de URLs absolutas. Esto permite que el proxy de Vite funcione correctamente:

- **En desarrollo:** `/api/auth/login` → Vite proxea → `http://localhost:5000/api/auth/login`
- **En producción:** Usa `VITE_API_URL` si está configurado

## 🔄 Cambios Realizados

### 1. `src/services/api.ts`
- Cambiado para usar rutas relativas `/api` en desarrollo
- El proxy de Vite maneja automáticamente la redirección al backend

### 2. `vite.config.ts`
- Proxy configurado para redirigir `/api` → `http://localhost:5000/api`

## 📋 Pasos para Aplicar

### 1. Reiniciar el Servidor del Frontend

```bash
# Detener (Ctrl+C)
npm run dev
```

### 2. Limpiar Cache del Navegador

- Presiona `Ctrl + Shift + R` (recarga forzada)
- O cierra y vuelve a abrir el navegador

### 3. Verificar que Funciona

**Abre la consola del navegador (F12) y ejecuta:**
```javascript
// Debería usar ruta relativa
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Debería funcionar sin errores de CORS.**

## 🎯 Cómo Funciona Ahora

### Desarrollo (localhost)
```
Frontend: http://localhost:3000
Backend: http://localhost:5000

Request: fetch('/api/auth/login')
  ↓
Vite Proxy intercepta `/api`
  ↓
Redirige a: http://localhost:5000/api/auth/login
  ↓
Backend responde
```

### Red Local (192.168.1.130)
```
Frontend: http://192.168.1.130:3000
Backend: http://localhost:5000 (solo accesible desde la misma máquina)

Request: fetch('/api/auth/login')
  ↓
Vite Proxy intercepta `/api`
  ↓
Redirige a: http://localhost:5000/api/auth/login
  ↓
Backend responde
```

## ⚠️ Importante

- **Siempre usa rutas relativas** (`/api/...`) en el código del frontend
- **Nunca uses URLs absolutas** (`http://localhost:5000/api/...`) en desarrollo
- **El proxy de Vite maneja todo automáticamente**

## 🐛 Si Sigue Sin Funcionar

1. **Verifica que el backend está corriendo:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Verifica la configuración del proxy en `vite.config.ts`:**
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:5000',
       changeOrigin: true,
     },
   }
   ```

3. **Reinicia ambos servidores:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Limpia completamente el cache:**
   - Cierra el navegador completamente
   - Abre en modo incógnito
   - O limpia el cache manualmente

