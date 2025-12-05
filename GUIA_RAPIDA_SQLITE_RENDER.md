# ⚡ Guía Rápida: Desplegar con SQLite en Render (Demo Rápida)

Esta guía es para una demo rápida donde no importa perder los datos. SQLite es más simple de configurar pero los datos se borrarán cuando Render reinicie el servidor.

## ⚠️ Advertencia Importante

- ✅ **Funciona para:** Demos rápidas, mostrar funcionalidad
- ❌ **NO funciona para:** Datos persistentes, producción
- ⚠️ **Los datos se borrarán** cuando Render reinicie el servidor

## 🚀 Pasos Rápidos

### Paso 1: Prepara tu código en GitHub

1. Asegúrate de que tu código esté en GitHub
2. Verifica que `.gitignore` incluya `*.db` y `.env`

### Paso 2: Crear el Backend en Render

1. Ve a [render.com](https://render.com) y crea cuenta
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `go2motion-backend`
   - **Environment**: `Node`
   - **Root Directory**: `server` (si el backend está en esa carpeta)
   - **Build Command**: 
     ```bash
     npm install && npm run db:switch-sqlite && npm run db:generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Plan**: Free

### Paso 3: Variables de Entorno (Mínimas)

En la sección **"Environment Variables"**, agrega solo estas:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<Genera uno aleatorio de 32+ caracteres>
FRONTEND_URL=https://go2motion-frontend.onrender.com
ADMIN_EMAILS=rasparecords@gmail.com
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**💡 NO necesitas `DATABASE_URL`** porque SQLite usa un archivo local.

**💡 Para generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 4: Crear el Frontend

1. En Render, haz clic en **"New +"** → **"Static Site"**
2. Selecciona el mismo repositorio
3. Configura:
   - **Name**: `go2motion-frontend`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Variable de Entorno:**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://go2motion-backend.onrender.com/api`
   - (Reemplaza `go2motion-backend` con el nombre real de tu servicio)

### Paso 5: Actualizar FRONTEND_URL

1. Ve a tu servicio backend
2. Actualiza `FRONTEND_URL` con la URL real del frontend
3. Guarda (Render redeployará automáticamente)

### Paso 6: Ejecutar Migraciones (Primera vez)

Después de que el backend se despliegue:

1. Ve a la pestaña **"Shell"** del backend en Render
2. Ejecuta:
   ```bash
   cd server
   npm run db:push
   ```
3. Esto creará el archivo `dev.db` con todas las tablas

## ✅ Verificar que Funciona

1. **Backend**: Visita `https://go2motion-backend.onrender.com/api/health`
2. **Frontend**: Visita `https://go2motion-frontend.onrender.com`
3. **Prueba**: Regístrate, inicia sesión, sube un video

## ⚠️ Limitaciones que Debes Saber

### Los datos se borrarán cuando:
- Render reinicie el servidor automáticamente (cada cierto tiempo)
- Hagas un cambio en el código y redeployes
- El servidor se "duerma" (plan Free) y se despierte

### Para evitar pérdida de datos durante la demo:
- ✅ Haz la demo en una sesión continua
- ✅ No hagas cambios en el código durante la demo
- ✅ Si el servidor se "duerme", la primera solicitud lo despertará (tarda ~30 seg)

## 🎯 Resumen

**Ventajas:**
- ✅ Configuración más rápida (no necesitas crear base de datos)
- ✅ Menos variables de entorno
- ✅ Perfecto para demos rápidas

**Desventajas:**
- ❌ Datos no persistentes
- ❌ Se borran al reiniciar
- ❌ No profesional para producción

## 📝 Nota para el Cliente

Cuando muestres la demo, puedes decirle:
> "Esta es una versión de demostración. Los datos son temporales y se reinician periódicamente. En producción, los datos serán persistentes."

## 🔄 Migrar a PostgreSQL Después

Si después quieres datos persistentes:

1. Crea PostgreSQL en Render
2. Cambia el Build Command a:
   ```bash
   npm install && npm run db:switch-postgresql && npm run db:generate && npm run build
   ```
3. Agrega `DATABASE_URL` con la Internal Database URL
4. Ejecuta `npm run db:push` desde la consola

¡Listo! Tienes una demo funcionando en minutos. 🎉

