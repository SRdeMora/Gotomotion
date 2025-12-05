# 🚀 Inicio Rápido - Go2Motion Awards

Guía rápida para poner en marcha el proyecto completo.

## ⚡ Inicio Rápido (5 minutos)

### 1. Backend

```bash
# Entrar a la carpeta del servidor
cd server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Configurar base de datos (asegúrate de tener PostgreSQL corriendo)
npm run db:generate
npm run db:push

# Iniciar servidor
npm run dev
```

El backend estará en `http://localhost:5000`

### 2. Frontend

```bash
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias (si no lo has hecho)
npm install

# Configurar variables de entorno
# Crea .env con:
# VITE_API_URL=http://localhost:5000

# Iniciar frontend
npm run dev
```

El frontend estará en `http://localhost:3000`

## 📋 Checklist de Configuración

### Backend (.env)
- [ ] `DATABASE_URL` - URL de PostgreSQL
- [ ] `JWT_SECRET` - Secreto para JWT (mínimo 32 caracteres)
- [ ] `CLOUDINARY_CLOUD_NAME` - Nombre de tu cuenta Cloudinary
- [ ] `CLOUDINARY_API_KEY` - API Key de Cloudinary
- [ ] `CLOUDINARY_API_SECRET` - API Secret de Cloudinary
- [ ] `SENTRY_DSN` - (Opcional) DSN de Sentry
- [ ] `FRONTEND_URL` - URL del frontend (http://localhost:3000 para desarrollo)

### Frontend (.env)
- [ ] `VITE_API_URL` - URL del backend (http://localhost:5000 para desarrollo)

## 🗄️ Base de Datos

### Opción 1: PostgreSQL Local

1. Instala PostgreSQL
2. Crea una base de datos:
   ```sql
   CREATE DATABASE go2motion;
   ```
3. Configura `DATABASE_URL` en `.env`:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/go2motion"
   ```

### Opción 2: PostgreSQL en la Nube (Gratis)

- **Supabase**: https://supabase.com (gratis hasta 500MB)
- **Neon**: https://neon.tech (gratis hasta 3GB)
- **Railway**: https://railway.app (tier gratuito disponible)

## ☁️ Cloudinary (Almacenamiento de Archivos)

1. Crea cuenta en https://cloudinary.com (gratis)
2. Ve a Dashboard → Settings
3. Copia:
   - Cloud Name
   - API Key
   - API Secret
4. Pégales en el `.env` del backend

## 🔍 Verificar que Todo Funciona

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Debe responder: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   - Abre http://localhost:3000
   - Deberías ver la página de inicio

3. **Registro:**
   - Ve a `/auth`
   - Regístrate como Votante
   - Deberías poder iniciar sesión

## 🐛 Problemas Comunes

### "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` sea correcta
- Verifica permisos del usuario de PostgreSQL

### "JWT_SECRET not configured"
- Asegúrate de tener `JWT_SECRET` en `.env`
- Debe ser una cadena de al menos 32 caracteres

### CORS errors
- Verifica que `FRONTEND_URL` en backend coincida con tu URL frontend
- Verifica que `VITE_API_URL` en frontend sea correcta

### "Module not found" en frontend
- Ejecuta `npm install` en la raíz del proyecto
- Verifica que los archivos en `src/services/` existan

## 📚 Documentación Completa

- **API**: Ver `API_DOCUMENTATION.md`
- **Despliegue**: Ver `DEPLOYMENT.md`
- **Backend**: Ver `server/README.md`

## ✅ Siguiente Paso

Una vez que todo funcione localmente:
1. Lee `DEPLOYMENT.md` para desplegar en producción
2. Configura Sentry para error tracking
3. Configura dominio y SSL
4. ¡Listo para producción! 🎉

