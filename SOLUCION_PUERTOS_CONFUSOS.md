# 🔧 Solución: Puertos Confusos

## 🔍 Problema Detectado

El diagnóstico muestra que:
- **Puerto 3001:** Está sirviendo el **FRONTEND** (Vite)
- **Puerto 5000:** Está sirviendo el **BACKEND** (probablemente)

Pero el código está configurado para buscar el backend en el puerto 3001.

## ✅ Solución

Tienes dos opciones:

### Opción 1: Usar Backend en Puerto 5000 (Recomendado)

**1. Actualizar `.env` en la raíz:**
```env
VITE_API_URL=http://localhost:5000
```

**2. Actualizar `vite.config.ts`:**
```typescript
proxy: {
  '/api': {
    target: env.VITE_API_URL || 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

**3. Reiniciar frontend:**
```bash
# Detener (Ctrl+C)
npm run dev
```

### Opción 2: Cambiar Backend a Puerto 3001

**1. Verificar `server/.env`:**
```env
PORT=3001
```

**2. Detener el backend actual (Ctrl+C)**

**3. Reiniciar backend:**
```bash
cd server
npm run dev
# Deberías ver: Server running on port 3001
```

**4. Cambiar frontend a otro puerto (ej: 3000):**

**En `vite.config.ts`:**
```typescript
server: {
  port: 3000,  // Cambiar a 3000
  host: '0.0.0.0',
  ...
}
```

**5. Actualizar `server/.env`:**
```env
FRONTEND_URL=http://localhost:3000
```

## 🎯 Configuración Recomendada

**Frontend:** Puerto 3000
**Backend:** Puerto 5000

**`.env` (raíz):**
```env
VITE_API_URL=http://localhost:5000
```

**`server/.env`:**
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## 🔍 Verificación

**Backend:**
```bash
curl http://localhost:5000/health
# Debería devolver: {"status":"ok","timestamp":"..."}
```

**Frontend:**
```bash
# Debería estar en http://localhost:3000
```

## ⚠️ Importante

- **Un puerto = Un servicio**
- **No puedes tener frontend y backend en el mismo puerto**
- **Verifica qué está corriendo en cada puerto antes de cambiar la configuración**

