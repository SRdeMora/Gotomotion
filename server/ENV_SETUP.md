# 🔧 Configuración de Variables de Entorno

## ⚠️ IMPORTANTE: Crea el archivo `.env` manualmente

Los archivos `.env` están en `.gitignore` por seguridad, así que debes crearlos manualmente.

## 📝 Pasos para crear el archivo `.env`

### 1. Backend (server/.env)

Crea un archivo llamado `.env` en la carpeta `server/` con este contenido:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
# IMPORTANTE: Cambia esto con tu URL de PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/go2motion?schema=public"

# JWT Secret
# IMPORTANTE: Genera un secreto seguro de al menos 32 caracteres
JWT_SECRET="cambia_este_secreto_por_uno_seguro_minimo_32_caracteres_12345678901234567890"
JWT_EXPIRES_IN=7d

# Cloudinary (for file uploads)
# Obtén estas credenciales en https://cloudinary.com (cuenta gratuita disponible)
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui

# Sentry (Error Tracking) - OPCIONAL
SENTRY_DSN=

# CORS - URL del frontend
FRONTEND_URL=http://localhost:3000

# Admin Emails (separados por comas)
# IMPORTANTE: Agrega aquí los emails que pueden acceder al panel de administración
ADMIN_EMAILS=admin@go2motion.com
```

### 2. Frontend (.env)

Crea un archivo llamado `.env` en la raíz del proyecto con este contenido:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000

# Optional: Gemini API (if needed)
GEMINI_API_KEY=

# Admin Emails (para mostrar link Admin en navbar)
VITE_ADMIN_EMAILS=admin@go2motion.com
```

## 🚀 Comandos Rápidos (Windows PowerShell)

### Crear .env del backend:
```powershell
cd server
@"
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://usuario:password@localhost:5432/go2motion?schema=public"
JWT_SECRET="cambia_este_secreto_por_uno_seguro_minimo_32_caracteres_12345678901234567890"
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
SENTRY_DSN=
FRONTEND_URL=http://localhost:3000
ADMIN_EMAILS=admin@go2motion.com
"@ | Out-File -FilePath .env -Encoding utf8
```

### Crear .env del frontend:
```powershell
cd ..
@"
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=
VITE_ADMIN_EMAILS=admin@go2motion.com
"@ | Out-File -FilePath .env -Encoding utf8
```

## 📋 Checklist de Configuración

Antes de ejecutar el proyecto, asegúrate de tener:

- [ ] Archivo `server/.env` creado
- [ ] Archivo `.env` en la raíz creado
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `go2motion` creada
- [ ] `DATABASE_URL` configurada correctamente
- [ ] `JWT_SECRET` cambiado por un secreto seguro
- [ ] Credenciales de Cloudinary (opcional para empezar)

## 🔍 Verificar que los archivos existen

```powershell
# Verificar backend
Test-Path server\.env

# Verificar frontend
Test-Path .env
```

Si ambos devuelven `True`, los archivos están creados correctamente.

