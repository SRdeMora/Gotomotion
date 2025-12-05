# 🔧 Configuración de Puertos

## 📋 Puertos por Defecto

- **Frontend:** `3000` (configurado en `vite.config.ts`)
- **Backend:** `3001` (configurado en `server/.env`)

## ⚙️ Configuración

### Backend (server/.env)

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env en la raíz)

```env
VITE_API_URL=http://localhost:3001
```

## 🔄 Cambiar Puertos

### Cambiar Puerto del Backend

**1. Edita `server/.env`:**
```env
PORT=3001  # Cambia este número
```

**2. Reinicia el servidor backend**

**3. Actualiza `VITE_API_URL` en `.env` de la raíz:**
```env
VITE_API_URL=http://localhost:3001  # Mismo puerto que PORT en server/.env
```

**4. Reinicia el servidor frontend**

### Cambiar Puerto del Frontend

**1. Edita `vite.config.ts`:**
```typescript
server: {
  port: 3000,  // Cambia este número
  ...
}
```

**2. Actualiza `FRONTEND_URL` en `server/.env`:**
```env
FRONTEND_URL=http://localhost:3000  # Mismo puerto que port en vite.config.ts
```

**3. Reinicia ambos servidores**

## ✅ Verificación

### Verificar Backend

```bash
# Debería mostrar el puerto correcto
cd server
npm run dev
# Deberías ver: Server running on port 3001
```

### Verificar Frontend

```bash
# Debería mostrar el puerto correcto
npm run dev
# Deberías ver: Local: http://localhost:3000/
```

### Probar Conexión

```bash
# Probar backend
curl http://localhost:3001/health

# O en el navegador
http://localhost:3001/health
```

## 🐛 Problemas Comunes

### "Failed to fetch"
- Verifica que `VITE_API_URL` en `.env` apunta al puerto correcto del backend
- Verifica que el backend está corriendo en ese puerto
- Reinicia el frontend después de cambiar `.env`

### "CORS error"
- Verifica que `FRONTEND_URL` en `server/.env` apunta al puerto correcto del frontend
- Reinicia el backend después de cambiar `server/.env`

### Puerto ocupado
- Cambia el puerto en la configuración correspondiente
- O cierra el proceso que está usando ese puerto

## 📝 Resumen de Archivos

| Archivo | Variable | Valor por Defecto |
|---------|----------|-------------------|
| `server/.env` | `PORT` | `3001` |
| `server/.env` | `FRONTEND_URL` | `http://localhost:3000` |
| `.env` (raíz) | `VITE_API_URL` | `http://localhost:3001` |
| `vite.config.ts` | `server.port` | `3000` |

