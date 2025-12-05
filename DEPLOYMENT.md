# 🚀 Guía de Despliegue - Go2Motion Awards

Esta guía te ayudará a desplegar tanto el frontend como el backend de Go2Motion Awards en producción.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo
- Cuenta de Cloudinary (para almacenamiento de archivos)
- Cuenta de Sentry (opcional, para error tracking)
- Servidor/hosting (Vercel, Railway, Heroku, AWS, etc.)

## 🔧 Configuración del Backend

### 1. Instalar Dependencias

```bash
cd server
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server/`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database (usa tu URL de PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/go2motion?schema=public"

# JWT (genera un secreto seguro)
JWT_SECRET="tu_secreto_super_seguro_minimo_32_caracteres"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Sentry (opcional)
SENTRY_DSN="tu_sentry_dsn"

# CORS (URL de tu frontend)
FRONTEND_URL="https://tu-dominio.com"
```

### 3. Configurar Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push

# O crear migración
npm run db:migrate
```

### 4. Build y Start

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor
npm start
```

## 🎨 Configuración del Frontend

### 1. Instalar Dependencias

```bash
cd .. # Volver a la raíz del proyecto
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://tu-backend-api.com/api
```

### 3. Build

```bash
npm run build
```

Los archivos estarán en la carpeta `dist/`.

## 🌐 Opciones de Despliegue

### Opción 1: Vercel (Recomendado para Frontend)

1. **Frontend:**
   ```bash
   npm install -g vercel
   vercel
   ```
   Configura `VITE_API_URL` en las variables de entorno de Vercel.

2. **Backend:**
   - Usa Railway, Render, o Heroku para el backend
   - O despliega en Vercel usando serverless functions

### Opción 2: Railway (Recomendado para Backend)

1. Conecta tu repositorio en Railway
2. Configura las variables de entorno
3. Railway detectará automáticamente Node.js y ejecutará `npm start`

### Opción 3: Docker

Crea un `Dockerfile` para el backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/ .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Y para el frontend:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Opción 4: Servidor VPS (Ubuntu/Debian)

1. **Instalar Node.js y PostgreSQL:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql
   ```

2. **Configurar PostgreSQL:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE go2motion;
   CREATE USER go2motion_user WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE go2motion TO go2motion_user;
   ```

3. **Clonar y configurar:**
   ```bash
   git clone tu-repositorio
   cd Mayte
   # Configurar .env en server/
   cd server && npm install && npm run build
   ```

4. **Usar PM2 para mantener el proceso:**
   ```bash
   npm install -g pm2
   cd server
   pm2 start dist/index.js --name go2motion-backend
   pm2 save
   pm2 startup
   ```

5. **Configurar Nginx como reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           root /ruta/a/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 🔒 Seguridad en Producción

1. **HTTPS:** Configura SSL/TLS (Let's Encrypt es gratuito)
2. **Variables de Entorno:** Nunca commits archivos `.env`
3. **JWT Secret:** Usa un secreto fuerte y único
4. **Rate Limiting:** Ya está configurado en el backend
5. **CORS:** Configura correctamente `FRONTEND_URL`
6. **Database:** Usa conexiones seguras (SSL)

## 📊 Monitoreo

### Sentry (Error Tracking)

1. Crea cuenta en [sentry.io](https://sentry.io)
2. Crea un proyecto Node.js
3. Copia el DSN a `SENTRY_DSN` en `.env`

### Health Check

El backend expone un endpoint de health check:
```
GET /health
```

Úsalo para monitoreo con servicios como UptimeRobot.

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. **Backend:**
   ```bash
   cd server
   git pull
   npm install
   npm run db:migrate  # Si hay cambios en el esquema
   npm run build
   pm2 restart go2motion-backend  # O reinicia tu servicio
   ```

2. **Frontend:**
   ```bash
   git pull
   npm install
   npm run build
   # Sube dist/ a tu hosting
   ```

## 🐛 Troubleshooting

### Backend no inicia
- Verifica que PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` sea correcta
- Revisa los logs: `pm2 logs go2motion-backend`

### Errores de CORS
- Verifica que `FRONTEND_URL` en backend coincida con tu dominio frontend
- Verifica que el frontend use la URL correcta en `VITE_API_URL`

### Errores de base de datos
- Ejecuta `npm run db:push` para sincronizar esquema
- Verifica permisos del usuario de PostgreSQL

## 📞 Soporte

Para problemas o preguntas, consulta la documentación o contacta al equipo de desarrollo.

