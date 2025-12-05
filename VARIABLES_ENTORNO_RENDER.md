# 🔐 Variables de Entorno para Render

Aquí tienes todas las variables de entorno que necesitas configurar en Render.

## 🔧 Backend (go2motion-backend)

### Obligatorias

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<Internal Database URL de Render>
JWT_SECRET=<Genera uno aleatorio de al menos 32 caracteres>
FRONTEND_URL=https://go2motion-frontend.onrender.com
ADMIN_EMAILS=rasparecords@gmail.com
```

### Cloudinary (Obligatorias para subir archivos)

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Opcionales

```env
SENTRY_DSN=<Opcional, para error tracking>
```

## 🎨 Frontend (go2motion-frontend)

### Obligatoria

```env
VITE_API_URL=https://go2motion-backend.onrender.com/api
```

## 📝 Cómo Generar JWT_SECRET

Puedes generar un JWT_SECRET seguro usando uno de estos métodos:

### Opción 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opción 2: Online
Visita: https://generate-secret.vercel.app/32

### Opción 3: Manual
Crea una cadena aleatoria de al menos 32 caracteres con letras, números y símbolos.

## 🔗 Cómo Obtener las URLs

### DATABASE_URL (Internal)
1. Ve a tu base de datos en Render
2. En la sección "Connections", copia la **"Internal Database URL"**
3. Se ve así: `postgresql://user:password@host:5432/dbname`

### FRONTEND_URL
- Es la URL pública de tu servicio frontend
- Ejemplo: `https://go2motion-frontend.onrender.com`
- **NO** incluyas `/` al final

### VITE_API_URL
- Es la URL pública de tu servicio backend + `/api`
- Ejemplo: `https://go2motion-backend.onrender.com/api`
- **SÍ** incluye `/api` al final

## ⚠️ Importante

1. **No compartas estas variables** públicamente
2. **DATABASE_URL** debe ser la **Internal Database URL** (no la externa)
3. Las URLs deben coincidir exactamente (sin espacios, sin `/` al final excepto donde se indica)
4. Después de crear ambos servicios, actualiza `FRONTEND_URL` en el backend con la URL real del frontend

