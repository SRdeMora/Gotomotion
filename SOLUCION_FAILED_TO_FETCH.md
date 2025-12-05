# 🔧 Solución: Error "Failed to fetch" en Panel Admin

## 🔍 Diagnóstico del Problema

El error "Failed to fetch" generalmente indica que:
1. El servidor backend no está corriendo
2. La URL de la API está mal configurada
3. Hay un problema de CORS
4. El token de autenticación no está siendo enviado correctamente

## ✅ Soluciones Paso a Paso

### 1. Verificar que el Backend Está Corriendo

**Abre una terminal y ejecuta:**
```bash
cd server
npm run dev
```

**Deberías ver algo como:**
```
Server running on port 5000
```

**Si no está corriendo:**
- Verifica que tienes todas las dependencias instaladas: `npm install`
- Verifica que el archivo `server/.env` existe y está configurado
- Verifica que PostgreSQL está corriendo (si usas base de datos)

### 2. Verificar la URL de la API

**Abre el archivo `.env` en la raíz del proyecto y verifica:**
```env
VITE_API_URL=http://localhost:5000
```

**Si no existe, créalo:**
```bash
# En la raíz del proyecto
echo "VITE_API_URL=http://localhost:5000" > .env
```

**Reinicia el servidor de desarrollo del frontend:**
```bash
# Detener (Ctrl+C) y volver a iniciar
npm run dev
```

### 3. Verificar que Estás Autenticado

**Abre la consola del navegador (F12) y verifica:**
```javascript
// En la consola del navegador
localStorage.getItem('token')
```

**Si es `null`, debes iniciar sesión primero:**
1. Ve a `http://localhost:3000/auth`
2. Inicia sesión con tu email de admin
3. Vuelve a intentar acceder a `/admin`

### 4. Verificar Configuración de Admin

**Abre `server/.env` y verifica:**
```env
ADMIN_EMAILS=tu-email@ejemplo.com
```

**El email debe coincidir EXACTAMENTE con el email con el que iniciaste sesión.**

### 5. Verificar CORS

**Abre `server/src/index.ts` y verifica que CORS está configurado:**
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

### 6. Probar la Conexión Manualmente

**Abre la consola del navegador (F12) y ejecuta:**
```javascript
// Obtener el token
const token = localStorage.getItem('token');

// Probar la conexión
fetch('http://localhost:5000/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Si esto funciona, el problema está en el código del frontend.**
**Si esto falla, el problema está en el backend o la conexión.**

## 🐛 Errores Comunes y Soluciones

### Error: "NetworkError when attempting to fetch resource"
**Causa:** El servidor backend no está corriendo o no es accesible.
**Solución:** 
- Verifica que el backend está corriendo en el puerto 5000
- Verifica que no hay firewall bloqueando la conexión
- Prueba acceder directamente a `http://localhost:5000/api/auth/login` en el navegador

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Causa:** Problema de CORS.
**Solución:**
- Verifica `FRONTEND_URL` en `server/.env`
- Reinicia el servidor backend después de cambiar `.env`
- Verifica que `cors` está instalado: `npm install cors` en `server/`

### Error: "401 Unauthorized"
**Causa:** No estás autenticado o el token es inválido.
**Solución:**
- Inicia sesión primero en `/auth`
- Verifica que el token está guardado en `localStorage`
- Verifica que el token no ha expirado

### Error: "403 Forbidden"
**Causa:** Tu email no está en la lista de administradores.
**Solución:**
- Verifica `ADMIN_EMAILS` en `server/.env`
- Asegúrate de usar el mismo email con el que iniciaste sesión
- Reinicia el servidor backend después de cambiar `.env`

## 📋 Checklist de Verificación

Antes de reportar el error, verifica:

- [ ] Backend corriendo en puerto 5000 (`npm run dev` en `server/`)
- [ ] Frontend corriendo en puerto 3000 (`npm run dev` en raíz)
- [ ] Archivo `server/.env` existe y tiene `ADMIN_EMAILS`
- [ ] Archivo `.env` en raíz existe y tiene `VITE_API_URL=http://localhost:5000`
- [ ] Has iniciado sesión con el email configurado como admin
- [ ] El token existe en `localStorage` (verificar en consola)
- [ ] PostgreSQL está corriendo (si usas base de datos)
- [ ] No hay errores en la consola del navegador (F12)
- [ ] No hay errores en la terminal del backend

## 🔄 Reiniciar Todo

Si nada funciona, prueba reiniciar todo:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd ..
npm run dev
```

Luego:
1. Abre `http://localhost:3000/auth`
2. Inicia sesión con tu email de admin
3. Ve a `http://localhost:3000/admin`

## 💡 Debug Avanzado

**Abre la consola del navegador (F12) y revisa:**
- Pestaña "Network" → Busca la petición a `/api/admin/dashboard`
- Verifica el Status Code (debe ser 200)
- Verifica los Headers de la petición (debe incluir Authorization)
- Verifica la respuesta del servidor

**En la terminal del backend, deberías ver:**
```
GET /api/admin/dashboard 200
```

Si ves un error diferente, ese es el problema real.

