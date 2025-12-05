# Configurar Auto-Deploy en Render

## ⚠️ Problema Actual

Render **NO se despliega automáticamente** porque necesita estar conectado a GitHub y tener Auto-Deploy habilitado.

## ✅ Solución: Configurar Auto-Deploy

Tienes **2 opciones**:

### Opción 1: Conectar Servicios Existentes a GitHub (RECOMENDADO)

Si ya creaste los servicios manualmente en Render:

#### 1. Conectar Backend a GitHub

1. Ve a tu servicio **Backend** en Render: `https://dashboard.render.com`
2. Haz clic en **"Settings"** (Configuración)
3. En la sección **"Source"**, haz clic en **"Connect GitHub"**
4. Autoriza Render a acceder a tu repositorio
5. Selecciona el repositorio: `SRdeMora/Gotomotion`
6. Selecciona la rama: `master`
7. En **"Auto-Deploy"**, asegúrate de que esté en **"Yes"**
8. Haz clic en **"Save Changes"**

#### 2. Conectar Frontend a GitHub

1. Ve a tu servicio **Frontend** en Render
2. Haz clic en **"Settings"**
3. En la sección **"Source"**, haz clic en **"Connect GitHub"**
4. Selecciona el repositorio: `SRdeMora/Gotomotion`
5. Selecciona la rama: `master`
6. En **"Auto-Deploy"**, asegúrate de que esté en **"Yes"**
7. Haz clic en **"Save Changes"**

#### 3. Forzar un Deploy Manual (Primera vez)

Después de conectar:
1. Ve a tu servicio Backend
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. Repite para el Frontend

### Opción 2: Usar Blueprint (render.yaml) - NUEVO DESPLIEGUE

Si prefieres empezar de cero con el Blueprint:

1. Ve a Render Dashboard: `https://dashboard.render.com`
2. Haz clic en **"New +"** → **"Blueprint"**
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Selecciona el repositorio: `SRdeMora/Gotomotion`
5. Render detectará automáticamente el archivo `render.yaml`
6. Haz clic en **"Apply"**
7. Render creará ambos servicios automáticamente

**⚠️ NOTA**: Si usas esta opción, los servicios anteriores se reemplazarán.

## 🔍 Verificar que Auto-Deploy Está Habilitado

1. Ve a tu servicio en Render
2. En **"Settings"** → **"Source"**
3. Verifica que:
   - ✅ **Repository** está conectado: `SRdeMora/Gotomotion`
   - ✅ **Branch** es: `master`
   - ✅ **Auto-Deploy** está en: **"Yes"**

## 🚀 Después de Configurar

Una vez configurado, cada vez que hagas `git push` a GitHub, Render detectará los cambios y desplegará automáticamente en 1-2 minutos.

## 📝 Verificar que los Cambios Están en GitHub

```bash
# Ver los últimos commits
git log --oneline -5

# Verificar que están en GitHub
git push origin master
```

Si ves "Everything up-to-date", significa que los cambios ya están en GitHub.

## 🆘 Si Render No Detecta los Cambios

1. Ve a tu servicio en Render
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. Esto forzará un deploy con el último código de GitHub

