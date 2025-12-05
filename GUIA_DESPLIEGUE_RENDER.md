# 🚀 Guía Paso a Paso: Desplegar Go2Motion Awards en Render

Esta guía te ayudará a desplegar tu aplicación completa en Render para mostrársela al cliente. Render es muy amigable y tiene una capa gratuita generosa para demos. Al conectarlo con GitHub, cada vez que hagas un cambio y hagas push, la web se actualizará sola (CI/CD automático).

## 📋 Paso 1: Prepara tu código en GitHub

Antes de ir a Render, asegúrate de que tu proyecto esté en GitHub.

### 1.1. Sube tu código
- Crea un repositorio en GitHub (puede ser privado)
- Sube tu proyecto completo

### 1.2. Importante: Verifica tu .gitignore
Asegúrate de que tu `.gitignore` incluya:
```
.env
server/.env
node_modules/
dist/
*.db
```

**⚠️ NUNCA subas archivos `.env` con tus contraseñas locales.** Las configuraremos en Render después.

### 1.3. Verifica tus scripts
Tu `server/package.json` ya tiene los scripts necesarios:
- `build`: Compila TypeScript
- `start`: Inicia el servidor

## 🗄️ Paso 2: Crear la Base de Datos (PostgreSQL)

**💡 Nota sobre SQLite:** Si estás pensando en usar SQLite para la demo, **NO es recomendable** porque Render tiene un sistema de archivos efímero que borra los datos cuando el servidor se reinicia. PostgreSQL es gratis en Render y es mucho más confiable. Lee `SQLITE_EN_RENDER.md` para más detalles.

El backend necesitará una base de datos para funcionar, así que la crearemos primero.

1. **Crea una cuenta en Render.com** (si no la tienes)
   - Ve a [render.com](https://render.com)
   - Regístrate con GitHub (más fácil)

2. **Crea la base de datos:**
   - Haz clic en **"New +"** en el dashboard
   - Selecciona **"PostgreSQL"**
   - Configura:
     - **Name**: `go2motion-db`
     - **Database**: `go2motion`
     - **User**: `go2motion_user`
     - **Plan**: **Free** (para la demo)
   - Haz clic en **"Create Database"**

3. **⚠️ IMPORTANTE: Copia la Internal Database URL**
   - Cuando se cree la base de datos, busca la sección **"Connections"**
   - Copia la **"Internal Database URL"** (se ve así: `postgresql://user:password@host:5432/dbname`)
   - **Guárdala**, la necesitarás en el siguiente paso

## 🔧 Paso 3: Desplegar el Backend (API)

Aquí es donde vivirá tu lógica de servidor.

### 3.1. Crear el servicio web

1. En el dashboard de Render, haz clic en **"New +"** y selecciona **"Web Service"**

2. **Conecta tu repositorio:**
   - Conecta tu cuenta de GitHub si no lo has hecho
   - Selecciona el repositorio de tu proyecto

3. **Configuración básica:**
   - **Name**: `go2motion-backend`
   - **Environment**: `Node`
   - **Region**: Elige el más cercano a ti
   - **Branch**: `main` (o la rama que uses)
   - **Root Directory**: `server` (deja vacío si el backend está en la raíz)
   - **Plan**: **Free**

4. **Build Command:**
   ```bash
   npm install && npm run db:switch-postgresql && npm run db:generate && npm run build
   ```

5. **Start Command:**
   ```bash
   npm start
   ```

### 3.2. Variables de Entorno (Environment Variables)

Baja hasta la sección **"Environment Variables"** y añade estas claves:

#### Obligatorias:
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<Pega aquí la Internal Database URL que copiaste en el Paso 2>
JWT_SECRET=<Genera uno aleatorio de al menos 32 caracteres>
FRONTEND_URL=https://go2motion-frontend.onrender.com
ADMIN_EMAILS=rasparecords@gmail.com
```

#### Cloudinary (para subir imágenes/videos):
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**💡 Cómo generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
O visita: https://generate-secret.vercel.app/32

**📝 Nota sobre FRONTEND_URL:** Por ahora pon cualquier URL, la actualizaremos después de crear el frontend.

### 3.3. Crear el servicio

1. Haz clic en **"Create Web Service"**
2. Espera a que termine el despliegue (puede tardar 5-10 minutos)
3. Render te dará una URL (ej: `https://go2motion-backend.onrender.com`)
4. **Cópiala**, la necesitarás para el frontend

### 3.4. Ejecutar migraciones de base de datos

Después de que el backend se despliegue:

1. Ve a tu servicio backend en Render
2. Haz clic en la pestaña **"Shell"** o **"Logs"**
3. En la consola, ejecuta:
   ```bash
   cd server
   npm run db:push
   ```
4. Esto creará todas las tablas en la base de datos

## 🎨 Paso 4: Desplegar el Frontend (La web visible)

Ahora subiremos la parte visual (React).

### 4.1. Actualizar la URL de la API en tu código

Antes de desplegar, necesitas cambiar la URL de la API en tu código:

1. **Opción A: Usar variable de entorno (Recomendado)**
   - Tu código ya usa `VITE_API_URL`
   - Solo necesitas configurarla en Render

2. **Opción B: Cambiar manualmente**
   - Busca en tu código donde haces llamadas a la API
   - Cambia `http://localhost:5000/api` por `https://go2motion-backend.onrender.com/api`
   - Haz commit y push a GitHub

### 4.2. Crear el servicio estático

1. En Render, haz clic en **"New +"** y selecciona **"Static Site"**

2. **Conecta tu repositorio:**
   - Selecciona el mismo repositorio (es un monorepo)

3. **Configuración:**
   - **Name**: `go2motion-frontend`
   - **Branch**: `main` (o la rama que uses)
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`
   - **Plan**: **Free**

4. **Variables de Entorno:**
   - Añade una variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://go2motion-backend.onrender.com/api`
     - (Reemplaza `go2motion-backend` con el nombre real de tu servicio backend)

5. Haz clic en **"Create Static Site"**

6. Espera a que termine el despliegue
7. Render te dará una URL (ej: `https://go2motion-frontend.onrender.com`)
8. **Esta es la URL que le darás al cliente** 🎉

### 4.3. Actualizar FRONTEND_URL en el backend

1. Ve a tu servicio backend en Render
2. Ve a **"Environment"** → **"Environment Variables"**
3. Actualiza `FRONTEND_URL` con la URL real del frontend:
   ```
   https://go2motion-frontend.onrender.com
   ```
4. Guarda los cambios (Render redeployará automáticamente)

## ⚠️ Paso Crítico: El problema de las Imágenes y Videos

Mencionaste que almacenas videos e imágenes. Aquí hay una limitación técnica importante en Render:

### El problema:
El sistema de archivos es **"Efímero"**. Esto significa que si subes un video a la carpeta `/uploads` de tu servidor en Render, el video funcionará bien... hasta que el servidor se reinicie (lo cual pasa cada vez que haces un cambio en el código o automáticamente cada cierto tiempo). Cuando se reinicia, los archivos subidos se borran.

### ¿Cómo solucionarlo para la demo?

#### ✅ Opción 1: Cloudinary (Ya implementado - Recomendado)
**Tu código ya está configurado para usar Cloudinary**, que es un servicio externo para almacenar imágenes y videos. Esto significa que:

- ✅ Los archivos NO se borran cuando el servidor se reinicia
- ✅ Funciona perfectamente para la demo
- ✅ Cloudinary tiene un plan gratuito generoso

**Solo necesitas:**
1. Crear una cuenta en [cloudinary.com](https://cloudinary.com) (gratis)
2. Obtener tus credenciales (Cloud Name, API Key, API Secret)
3. Añadirlas a las variables de entorno del backend en Render

**Guía rápida de Cloudinary:**
- Ve a [cloudinary.com](https://cloudinary.com) y crea cuenta
- En el Dashboard, verás:
  - **Cloud Name**: Lo verás en la parte superior
  - **API Key**: En "Account Details"
  - **API Secret**: En "Account Details" (haz clic en "Reveal")

#### Opción 2: "Rápida y Sucia" (Para enseñar hoy)
Simplemente avísale al cliente: "Los videos que subamos hoy son de prueba y se borrarán si actualizo la web, ya que estamos en un entorno de demostración". Para una demo en vivo, funciona.

#### Opción 3: Render Disk (De pago)
Render ofrece una opción llamada "Disks". Puedes "montar" un disco duro virtual en tu servicio para que los archivos no se borren. Cuesta unos pocos dólares al mes.

## ✅ Paso 5: Verificar que Todo Funciona

### Checklist de verificación:

- [ ] **Backend responde:**
  - Visita: `https://go2motion-backend.onrender.com/api/health`
  - Debería responder con un mensaje de éxito

- [ ] **Frontend carga:**
  - Visita: `https://go2motion-frontend.onrender.com`
  - Debería cargar la página principal

- [ ] **Puedes registrarte/iniciar sesión:**
  - Prueba crear una cuenta
  - Prueba iniciar sesión

- [ ] **Panel de admin funciona:**
  - Inicia sesión con el email que pusiste en `ADMIN_EMAILS`
  - Deberías ver el enlace "Admin" en la barra de navegación

- [ ] **Puedes subir videos/imágenes:**
  - Prueba subir un video o imagen
  - Verifica que se guarde correctamente

- [ ] **Los videos se muestran:**
  - Ve a la galería del concurso
  - Verifica que los videos se muestren correctamente

## 🎯 Resumen Final

Al terminar tendrás:

✅ **Una URL para tu Frontend** (la que le das al cliente):
```
https://go2motion-frontend.onrender.com
```

✅ **Una URL para tu Backend** (interna, nadie la ve):
```
https://go2motion-backend.onrender.com
```

✅ **Una Base de datos conectada** (PostgreSQL)

✅ **CI/CD automático**: Cada vez que hagas push a GitHub, Render actualizará automáticamente tu aplicación

## 💡 Tips Importantes

1. **Plan Free de Render:**
   - El backend se "duerme" después de 15 minutos de inactividad
   - La primera solicitud después de eso puede tardar ~30 segundos en responder mientras se despierta
   - El frontend siempre está disponible

2. **Base de datos Free:**
   - La base de datos Free se elimina después de 90 días si no la actualizas
   - Para producción real, considera el plan Starter ($7/mes)

3. **Actualizaciones automáticas:**
   - Cada vez que hagas `git push`, Render detectará los cambios y redeployará automáticamente
   - No necesitas hacer nada manual

4. **Logs en tiempo real:**
   - Puedes ver los logs de tu aplicación en tiempo real en Render
   - Ve a tu servicio → Pestaña "Logs"

## 🐛 Troubleshooting Común

### El backend no inicia
- Verifica que `DATABASE_URL` sea correcta (debe ser la Internal Database URL)
- Revisa los logs en Render para ver el error específico
- Asegúrate de que `PORT` sea `10000`

### Error de CORS
- Verifica que `FRONTEND_URL` en backend coincida exactamente con la URL del frontend
- No incluyas `/` al final de las URLs

### Error de base de datos
- Verifica que ejecutaste `npm run db:push` después del primer despliegue
- Revisa que `DATABASE_URL` use la **Internal Database URL** (no la externa)

### El frontend no carga
- Verifica que `VITE_API_URL` apunte al backend correcto
- Revisa la consola del navegador para errores
- Asegúrate de que el build se completó correctamente

### Videos/imágenes no se suben
- Verifica que Cloudinary esté configurado correctamente
- Revisa las credenciales de Cloudinary en las variables de entorno
- Revisa los logs del backend para ver errores específicos

## 📞 Siguiente Paso

Una vez desplegado, comparte la URL del frontend con tu cliente:
```
https://go2motion-frontend.onrender.com
```

¡Si sigues estos pasos, tendrás un link profesional para enviar por WhatsApp o correo en cuestión de minutos! 🎉
