# ✅ Verificación Rápida: Backend Corriendo

## 🔍 Verificar que el Backend Está Corriendo

### Paso 1: Verificar Backend

**Abre una terminal y ejecuta:**
```bash
cd server
npm run dev
```

**Deberías ver:**
```
Server running on port 5000
```

### Paso 2: Probar el Backend

**Abre otra terminal y ejecuta:**
```bash
# Probar endpoint de salud
curl http://localhost:5000/health
```

**O abre en el navegador:**
```
http://localhost:5000/health
```

**Deberías ver:**
```json
{"status":"ok","timestamp":"..."}
```

### Paso 3: Verificar Variables de Entorno

**Abre `server/.env` y verifica:**
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### Paso 4: Verificar que el Frontend Puede Conectarse

**Abre la consola del navegador (F12) y ejecuta:**
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(e => console.error('Error:', e));
```

**Si funciona:** El backend está bien configurado.
**Si falla:** Revisa los errores en la consola.

## 🚀 Comandos Rápidos

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend (en otra terminal)
cd ..
npm run dev

# Terminal 3 - Probar backend
curl http://localhost:5000/health
```

## ⚠️ Problemas Comunes

### "Cannot find module"
- Ejecuta `npm install` en `server/`

### "Port 5000 is already in use"
- Cierra el proceso que usa el puerto 5000
- O cambia el puerto en `server/.env`

### "Database connection error"
- Verifica que PostgreSQL está corriendo
- Verifica `DATABASE_URL` en `server/.env`

