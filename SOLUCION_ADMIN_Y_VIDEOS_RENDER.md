# 🔧 Solución: Admin y Subida de Videos en Render

## 🔴 Problemas Identificados

1. **No aparece la sección de Admin**
2. **No puede subir videos**

## ✅ Solución Paso a Paso

### 1. Configurar Variables de Entorno en Render

#### Backend (`go2motion-backend`)

Ve a Render → Backend → **Environment** → **Environment Variables**

**Asegúrate de tener estas variables:**

```
ADMIN_EMAILS=rasparecords@gmail.com
FRONTEND_URL=https://go2motion-frontend.onrender.com
JWT_SECRET=<un_secreto_aleatorio_largo>
CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
NODE_ENV=production
PORT=10000
```

**⚠️ IMPORTANTE:**
- `ADMIN_EMAILS` debe ser el email exacto con el que te registraste/iniciaste sesión
- No incluyas espacios
- Si tienes múltiples admins, sepáralos con comas: `email1@gmail.com,email2@gmail.com`

#### Frontend (`go2motion-frontend`)

Ve a Render → Frontend → **Environment** → **Environment Variables**

**Asegúrate de tener estas variables:**

```
VITE_API_URL=https://go2motion-backend.onrender.com/api
VITE_ADMIN_EMAILS=rasparecords@gmail.com
```

**⚠️ IMPORTANTE:**
- `VITE_API_URL` debe terminar con `/api`
- `VITE_ADMIN_EMAILS` debe ser el mismo email que en el backend

### 2. Verificar que Estás Logueado Correctamente

1. **Inicia sesión** con el email que está en `ADMIN_EMAILS`
2. **Verifica en la consola del navegador** (F12 → Console):
   - Deberías ver: `[ADMIN] Resultado final: {isAdmin: true, ...}`
   - Si ves `isAdmin: false`, el email no coincide

### 3. Redesplegar Servicios

Después de cambiar las variables:

1. **Backend:**
   - Ve a Render → Backend
   - Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

2. **Frontend:**
   - Ve a Render → Frontend
   - Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

3. **Espera 1-2 minutos** a que termine el despliegue

### 4. Verificar Permisos para Subir Videos

Para subir videos, necesitas:

1. **Estar logueado** ✅
2. **Tener rol de PARTICIPANT** (no solo VOTER)
3. **Haber completado el pago** (si está habilitado)

#### Convertirse en Participante:

1. Ve a **"Mi Perfil"** (`/profile`)
2. Haz clic en **"Convertirse en Participante"**
3. Selecciona **"Individual"** o **"Equipo"**
4. Guarda los cambios

### 5. Verificar que Cloudinary Está Configurado

Si Cloudinary no está configurado, los videos no se subirán correctamente.

**Verifica en Render → Backend → Environment Variables:**

```
CLOUDINARY_CLOUD_NAME=<debe tener un valor>
CLOUDINARY_API_KEY=<debe tener un valor>
CLOUDINARY_API_SECRET=<debe tener un valor>
```

Si no tienes Cloudinary configurado:
- Los videos se guardarán como base64 (solo para desarrollo)
- En producción, necesitas Cloudinary para subir archivos

## 🔍 Verificación Post-Configuración

### Verificar Admin:

1. **Inicia sesión** con el email de admin
2. **Abre la consola** (F12 → Console)
3. **Busca:** `[ADMIN] Resultado final`
4. **Deberías ver:** `isAdmin: true`
5. **En la barra de navegación** debería aparecer **"Admin"**

### Verificar Subida de Videos:

1. **Ve a "Mi Perfil"** (`/profile`)
2. **Verifica tu rol:** Debe ser `PARTICIPANT_INDIVIDUAL` o `PARTICIPANT_TEAM`
3. **Si eres VOTER:** Haz clic en "Convertirse en Participante"
4. **Ve a "Subir Video"** (`/upload-video`)
5. **Deberías poder** seleccionar categorías y subir videos

## 🆘 Si Sigue Sin Funcionar

### Para Admin:

1. **Verifica los logs del backend** en Render:
   - Ve a Backend → Logs
   - Busca: `[ADMIN] Email del usuario:`
   - Verifica que el email coincida exactamente con `ADMIN_EMAILS`

2. **Verifica en la consola del navegador:**
   - F12 → Console
   - Busca: `[ADMIN] Verificación backend:`
   - Verifica que `isAdmin: true`

3. **Limpia la caché del navegador:**
   - Ctrl+Shift+Delete
   - Selecciona "Cached images and files"
   - Limpia

### Para Subida de Videos:

1. **Verifica tu rol:**
   - Ve a `/profile`
   - Verifica que no seas solo `VOTER`

2. **Verifica los logs del backend:**
   - Intenta subir un video
   - Ve a Backend → Logs
   - Busca errores relacionados con permisos o Cloudinary

3. **Verifica que Cloudinary esté configurado:**
   - Si ves errores de Cloudinary, configura las variables de entorno

## 📋 Checklist Final

- [ ] `ADMIN_EMAILS` configurado en Backend con tu email exacto
- [ ] `VITE_ADMIN_EMAILS` configurado en Frontend con tu email exacto
- [ ] `VITE_API_URL` configurado en Frontend con `/api` al final
- [ ] Backend redesplegado después de cambiar variables
- [ ] Frontend redesplegado después de cambiar variables
- [ ] Iniciado sesión con el email de admin
- [ ] Verificado en consola que `isAdmin: true`
- [ ] Rol cambiado a PARTICIPANT si quieres subir videos
- [ ] Cloudinary configurado (si quieres subir archivos)

