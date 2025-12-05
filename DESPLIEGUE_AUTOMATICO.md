# 🤖 Despliegue Automático en Render

**TODO está automatizado.** Solo necesitas seguir estos pasos una vez y Render hará el resto automáticamente.

## ⚠️ IMPORTANTE: Necesitas GitHub

**Render necesita que tu código esté en GitHub** para poder desplegarlo automáticamente. Si no lo tienes ahí, sigue el Paso 1 primero.

## 🎯 Lo que está Automatizado

✅ **Build del backend** - Se ejecuta automáticamente  
✅ **Configuración de SQLite** - Se hace automáticamente  
✅ **Generación de Prisma** - Automática  
✅ **Compilación TypeScript** - Automática  
✅ **Inicialización de base de datos** - Automática  
✅ **Build del frontend** - Automático  
✅ **Configuración de URLs** - Automática  

## 📋 Pasos Únicos (Solo una vez)

### Paso 1: Subir código a GitHub (OBLIGATORIO)

**Render necesita que tu código esté en GitHub para conectarlo y desplegarlo.**

#### 1.1. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en **"New"** (botón verde)
3. Configura:
   - **Repository name**: `go2motion-awards` (o el nombre que quieras)
   - **Visibility**: Puede ser **Private** (recomendado)
   - **NO marques** "Initialize with README"
4. Haz clic en **"Create repository"**

#### 1.2. Subir tu Código

**Si Git ya está inicializado:**

```bash
# Verificar que estás en la raíz del proyecto
cd C:\Users\samue\Documents\Proyectos\Mayte

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparado para despliegue automático en Render"

# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO con los tuyos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git push -u origin main
```

**Si NO tienes Git inicializado:**

```bash
# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Código inicial - Go2Motion Awards"

# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO con los tuyos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git push -u origin main
```

**💡 Nota:** Tu `.gitignore` ya está configurado para NO subir archivos sensibles (`.env`, `*.db`, `node_modules/`).

**📖 Para más detalles:** Lee `PREPARAR_GITHUB.md`

### Paso 2: Crear cuenta en Render

```bash
git add .
git commit -m "Preparado para despliegue automático en Render"
git push
```

### Paso 2: Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub (más fácil - usa el mismo usuario de GitHub)
3. Conecta tu cuenta de GitHub cuando te lo pida

### Paso 3: Crear servicios desde Blueprint

1. En Render, haz clic en **"New +"** → **"Blueprint"**
2. Selecciona tu repositorio
3. Render detectará automáticamente el archivo `render.yaml`
4. Haz clic en **"Apply"**

### Paso 4: Configurar Variables de Entorno

Render creará los servicios automáticamente, pero necesitas agregar estas variables manualmente:

#### Backend (`go2motion-backend`):

Ve a **Environment** → **Environment Variables** y agrega:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
ADMIN_EMAILS=rasparecords@gmail.com
```

**Las demás variables se configuran automáticamente** (JWT_SECRET, PORT, FRONTEND_URL, etc.)

#### Frontend (`go2motion-frontend`):

**No necesitas hacer nada.** La variable `VITE_API_URL` se configura automáticamente.

### Paso 5: Esperar el Despliegue

Render ejecutará automáticamente:
- ✅ Build del backend
- ✅ Configuración de SQLite
- ✅ Inicialización de base de datos
- ✅ Build del frontend
- ✅ Configuración de URLs

**Tiempo estimado: 5-10 minutos**

## ✅ Verificar que Funciona

Una vez desplegado:

1. **Backend**: `https://go2motion-backend.onrender.com/api/health`
2. **Frontend**: `https://go2motion-frontend.onrender.com`

## 🔄 Actualizaciones Automáticas

**Cada vez que hagas `git push`:**
- Render detectará los cambios automáticamente
- Ejecutará los builds automáticamente
- Redeployará automáticamente

**No necesitas hacer nada más.**

## 📁 Archivos Creados (No tocar)

Estos archivos están creados para automatización y **NO debes modificarlos**:

- `render.yaml` - Configuración de Render
- `scripts/render-build-backend.sh` - Build automático del backend
- `scripts/render-build-frontend.sh` - Build automático del frontend
- `scripts/render-post-deploy.sh` - Inicialización post-deploy

**Estos archivos están separados del código de la web y no afectan el desarrollo local.**

## 🐛 Si Algo Falla

1. Ve a los **Logs** en Render
2. Revisa qué paso falló
3. Los scripts tienen mensajes claros de qué están haciendo

## 🎉 Listo

Una vez configurado, **todo es automático**. Solo haz `git push` y Render hace el resto.

