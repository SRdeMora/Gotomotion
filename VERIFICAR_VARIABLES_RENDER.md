# ⚠️ VERIFICAR VARIABLES DE ENTORNO EN RENDER

## 🔴 PROBLEMA DETECTADO

El frontend está intentando acceder a `/go2motion-backend/videos` en lugar de `/api/videos`.

Esto indica que `VITE_API_URL` está configurado incorrectamente en Render.

## ✅ SOLUCIÓN INMEDIATA

### 1. Verificar Variable en Render Frontend

Ve a Render → Frontend (`go2motion-frontend`) → **Environment** → **Environment Variables**

**DEBE estar configurado así:**

```
Key: VITE_API_URL
Value: https://go2motion-backend.onrender.com/api
```

**⚠️ IMPORTANTE:**
- ✅ **SÍ** incluye `/api` al final
- ✅ **SÍ** usa `https://`
- ❌ **NO** debe ser solo `https://go2motion-backend.onrender.com` (sin `/api`)

### 2. Verificar Variable en Render Backend

Ve a Render → Backend (`go2motion-backend`) → **Environment** → **Environment Variables**

**DEBE estar configurado así:**

```
Key: FRONTEND_URL
Value: https://go2motion-frontend.onrender.com
```

**⚠️ IMPORTANTE:**
- ❌ **NO** incluyas `/api` aquí
- ❌ **NO** incluyas `/` al final

### 3. Redesplegar Frontend

Después de cambiar las variables:

1. Ve a Render → Frontend
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. Espera 1-2 minutos

## 🔍 CÓMO VERIFICAR

### En el Navegador (F12 → Console)

Deberías ver:
```
[API] Respuesta de /auth/login: {user: {...}, token: "..."}
```

**NO deberías ver:**
```
/go2motion-backend/videos:1 Failed to load resource
```

### En Network Tab (F12 → Network)

Cuando hagas una request, deberías ver:
- **Request URL:** `https://go2motion-backend.onrender.com/api/videos`
- **Status:** `200 OK`

**NO deberías ver:**
- **Request URL:** `https://go2motion-frontend.onrender.com/go2motion-backend/videos`
- **Status:** `404 Not Found`

## 📋 CHECKLIST COMPLETO

- [ ] `VITE_API_URL` = `https://go2motion-backend.onrender.com/api` (con `/api`)
- [ ] `FRONTEND_URL` = `https://go2motion-frontend.onrender.com` (sin `/api`, sin `/` al final)
- [ ] Frontend redesplegado después de cambiar variables
- [ ] Backend redesplegado después de cambiar variables
- [ ] Verificado en navegador (F12 → Console) que las URLs son correctas

## 🆘 SI SIGUE SIN FUNCIONAR

1. **Limpia la caché del navegador:**
   - Ctrl+Shift+Delete
   - Selecciona "Cached images and files"
   - Limpia

2. **Verifica los logs de Render:**
   - Frontend → Logs
   - Busca errores relacionados con `VITE_API_URL`

3. **Verifica que el backend responde:**
   - Visita: `https://go2motion-backend.onrender.com/health`
   - Deberías ver: `{"status":"ok","timestamp":"..."}`

