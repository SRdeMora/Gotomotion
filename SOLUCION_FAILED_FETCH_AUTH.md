# 🔧 Solución: Failed to Fetch en Registro/Login

## 🔍 Diagnóstico

El error "Failed to fetch" significa que el frontend no puede conectarse al backend. Esto generalmente ocurre porque:

1. **El backend no está corriendo**
2. **La URL de la API está mal configurada**
3. **Hay un problema de CORS**
4. **El proxy de Vite no está funcionando**

## ✅ Solución Paso a Paso

### 1. Verificar que el Backend Está Corriendo

**Abre una terminal y ejecuta:**
```bash
cd server
npm run dev
```

**Deberías ver:**
```
Server running on port 5000
```

**Si no está corriendo:**
- Verifica que tienes `server/.env` configurado
- Verifica que PostgreSQL está corriendo (si usas base de datos)
- Verifica que no hay errores en la terminal

### 2. Verificar la Configuración de la API

**Abre el archivo `.env` en la raíz del proyecto:**
```env
VITE_API_URL=http://localhost:5000
```

**Si no existe, créalo:**
```bash
# En la raíz del proyecto
echo "VITE_API_URL=http://localhost:5000" > .env
```

**Reinicia el servidor del frontend** después de crear/modificar `.env`:
```bash
# Detener (Ctrl+C) y volver a iniciar
npm run dev
```

### 3. Verificar que Ambos Servidores Están Corriendo

**Necesitas DOS terminales:**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Debería mostrar: Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Debería mostrar: Local: http://localhost:3000/
```

### 4. Probar la Conexión Manualmente

**Abre la consola del navegador (F12) y ejecuta:**
```javascript
// Probar conexión al backend
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Si esto funciona**, el backend está bien y el problema está en el frontend.
**Si esto falla**, el problema está en el backend o la conexión.

### 5. Verificar CORS en el Backend

**Abre `server/src/index.ts` y verifica:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

**En `server/.env` debe estar:**
```env
FRONTEND_URL=http://localhost:3000
```

### 6. Verificar el Proxy de Vite

**El proxy en `vite.config.ts` debería estar así:**
```typescript
proxy: {
  '/api': {
    target: env.VITE_API_URL || 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

## 🚀 Solución Rápida

**Ejecuta estos comandos en orden:**

```bash
# 1. Iniciar backend (Terminal 1)
cd server
npm run dev

# 2. Verificar que el backend responde
# Abre otra terminal y ejecuta:
curl http://localhost:5000/health
# O visita en el navegador: http://localhost:5000/health

# 3. Verificar .env en la raíz
# Asegúrate de que existe .env con:
# VITE_API_URL=http://localhost:5000

# 4. Iniciar frontend (Terminal 2)
cd ..
npm run dev

# 5. Abrir navegador
# Ve a http://localhost:3000/auth
```

## 🐛 Errores Comunes

### Error: "NetworkError when attempting to fetch resource"
**Causa:** El backend no está corriendo o no es accesible.
**Solución:** 
- Verifica que el backend está corriendo en puerto 5000
- Verifica que no hay firewall bloqueando
- Prueba acceder a `http://localhost:5000/health` en el navegador

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Causa:** Problema de CORS.
**Solución:**
- Verifica `FRONTEND_URL` en `server/.env`
- Reinicia el servidor backend después de cambiar `.env`
- Verifica que `cors` está instalado: `npm install cors` en `server/`

### Error: "Failed to resolve import"
**Causa:** Problema con el proxy de Vite.
**Solución:**
- Verifica que `VITE_API_URL` está en `.env`
- Reinicia el servidor del frontend
- Verifica que `vite.config.ts` tiene la configuración del proxy

## 📋 Checklist de Verificación

Antes de reportar el problema, verifica:

- [ ] Backend corriendo en puerto 5000 (`cd server && npm run dev`)
- [ ] Frontend corriendo en puerto 3000 (`npm run dev`)
- [ ] Archivo `.env` en raíz existe con `VITE_API_URL=http://localhost:5000`
- [ ] Archivo `server/.env` existe con `FRONTEND_URL=http://localhost:3000`
- [ ] Puedes acceder a `http://localhost:5000/health` en el navegador
- [ ] No hay errores en la terminal del backend
- [ ] No hay errores en la terminal del frontend
- [ ] No hay errores en la consola del navegador (F12)

## 💡 Debug Avanzado

**Abre la consola del navegador (F12) y revisa:**
- Pestaña "Network" → Busca la petición a `/api/auth/register` o `/api/auth/login`
- Verifica el Status Code (debe ser 200 o 400, no CORS error)
- Verifica los Headers de la petición
- Verifica la respuesta del servidor

**En la terminal del backend, deberías ver:**
```
POST /api/auth/register 200
```
o
```
POST /api/auth/login 200
```

Si ves un error diferente, ese es el problema real.

