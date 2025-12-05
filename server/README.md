# Go2Motion Backend API

Backend completo para la plataforma Go2Motion Awards construido con Node.js, Express, TypeScript y PostgreSQL.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Subida de archivos a Cloudinary
- ✅ Rate limiting y seguridad con Helmet
- ✅ Error tracking con Sentry
- ✅ Validación de datos con express-validator
- ✅ API REST completa

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- Cuenta de Cloudinary (para subida de archivos)
- Cuenta de Sentry (opcional, para error tracking)

## 🛠️ Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con tus credenciales:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/go2motion"
   JWT_SECRET="tu_secreto_super_seguro"
   CLOUDINARY_CLOUD_NAME="tu_cloud_name"
   CLOUDINARY_API_KEY="tu_api_key"
   CLOUDINARY_API_SECRET="tu_api_secret"
   SENTRY_DSN="tu_sentry_dsn" # Opcional
   ```

3. **Configurar base de datos**
   ```bash
   # Generar cliente de Prisma
   npm run db:generate
   
   # Crear tablas en la base de datos
   npm run db:push
   ```

4. **Iniciar servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm run build
   npm start
   ```

## 📚 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users/:id` - Obtener perfil de usuario
- `PUT /api/users/:id` - Actualizar perfil

### Videos
- `GET /api/videos` - Listar videos (con filtros)
- `GET /api/videos/:id` - Obtener video específico
- `POST /api/videos` - Crear video (requiere autenticación de participante)
- `PUT /api/videos/:id` - Actualizar video
- `DELETE /api/videos/:id` - Eliminar video

### Votos
- `POST /api/votes/:videoId` - Votar por un video
- `DELETE /api/votes/:videoId` - Eliminar voto
- `GET /api/votes/:videoId/check` - Verificar si el usuario votó

### Foro
- `GET /api/forum/topics` - Listar temas del foro
- `GET /api/forum/topics/:id` - Obtener tema con respuestas
- `POST /api/forum/topics` - Crear tema (solo participantes)
- `POST /api/forum/topics/:topicId/replies` - Responder a un tema

### Ranking
- `GET /api/ranking` - Obtener ranking
- `GET /api/ranking/user/:userId` - Ranking de un usuario específico

## 🔒 Seguridad

- Autenticación JWT requerida para rutas protegidas
- Rate limiting (100 requests por 15 minutos por IP)
- Helmet para headers de seguridad
- Validación de datos en todos los endpoints
- Sanitización de inputs

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor en modo desarrollo
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor en producción
- `npm run db:generate` - Genera cliente de Prisma
- `npm run db:push` - Sincroniza esquema con base de datos
- `npm run db:migrate` - Crea migración
- `npm run db:studio` - Abre Prisma Studio

## 🐛 Debugging

El servidor incluye:
- Logs detallados en desarrollo
- Error tracking con Sentry en producción
- Health check endpoint: `GET /health`

## 📦 Despliegue

1. Configura variables de entorno en tu plataforma
2. Ejecuta migraciones: `npm run db:migrate`
3. Build: `npm run build`
4. Start: `npm start`

## 🔗 Integración con Frontend

El frontend debe hacer requests a `http://localhost:5000/api` (o la URL de tu backend en producción).

Incluye el token JWT en el header:
```
Authorization: Bearer <token>
```

