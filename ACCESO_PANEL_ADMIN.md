# 🔐 Cómo Acceder al Panel de Administrador

## 📋 Pasos para Acceder

### Paso 1: Configurar Email de Administrador

Debes agregar tu email a la lista de administradores en el archivo `server/.env`:

```env
# Agregar esta línea al archivo server/.env
ADMIN_EMAILS=tu-email@ejemplo.com
```

**Ejemplo:**
```env
ADMIN_EMAILS=admin@go2motion.com,otro-admin@go2motion.com
```

> ⚠️ **Importante:** Puedes agregar múltiples emails separados por comas.

### Paso 2: Configurar Frontend (Opcional)

Para que aparezca el link "Admin" en el navbar, agrega también en el archivo `.env` de la raíz:

```env
VITE_ADMIN_EMAILS=tu-email@ejemplo.com
```

### Paso 3: Reiniciar el Servidor

Después de modificar el `.env`, **debes reiniciar el servidor backend**:

```bash
# Detener el servidor (Ctrl+C)
# Luego volver a iniciarlo
cd server
npm run dev
```

### Paso 4: Crear Cuenta o Iniciar Sesión

1. Ve a la página de registro/login: `http://localhost:3000/auth`
2. **Regístrate o inicia sesión** con el email que configuraste como admin
3. Asegúrate de usar **exactamente el mismo email** que pusiste en `ADMIN_EMAILS`

### Paso 5: Acceder al Panel

Tienes **3 formas** de acceder:

#### Opción 1: Desde el Navbar (si configuraste VITE_ADMIN_EMAILS)
- Verás un link "Admin" en el menú de navegación
- Haz clic en "Admin"

#### Opción 2: Directamente por URL
- Ve a: `http://localhost:3000/admin`
- Si no eres admin, verás un error 403

#### Opción 3: Desde el código
- El panel está en la ruta `/admin`
- Siempre puedes navegar directamente

## 🔍 Verificar que Funciona

### Verificar Configuración Backend

1. Abre `server/.env`
2. Verifica que existe la línea:
   ```env
   ADMIN_EMAILS=tu-email@ejemplo.com
   ```

### Verificar que Eres Admin

1. Inicia sesión con tu email de admin
2. Ve a `http://localhost:3000/admin`
3. Deberías ver el dashboard con estadísticas

### Si No Funciona

**Error 403 (Acceso Denegado):**
- Verifica que el email en `ADMIN_EMAILS` coincide exactamente con el email con el que iniciaste sesión
- Verifica que reiniciaste el servidor después de cambiar `.env`
- Verifica que estás autenticado (tienes sesión iniciada)

**Error 401 (No Autenticado):**
- Debes iniciar sesión primero
- Ve a `/auth` y regístrate/inicia sesión

**No aparece el link Admin en el navbar:**
- Agrega `VITE_ADMIN_EMAILS` en el `.env` de la raíz
- Reinicia el servidor de desarrollo del frontend (`npm run dev`)

## 📝 Ejemplo Completo

### 1. Configurar `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://..."
JWT_SECRET="tu_secreto_aqui"
ADMIN_EMAILS=admin@go2motion.com
```

### 2. Configurar `.env` (raíz):
```env
VITE_API_URL=http://localhost:5000
VITE_ADMIN_EMAILS=admin@go2motion.com
```

### 3. Reiniciar servidores:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 4. Acceder:
1. Ve a `http://localhost:3000/auth`
2. Regístrate con `admin@go2motion.com`
3. Ve a `http://localhost:3000/admin`

## 🎯 Resumen Rápido

```bash
# 1. Editar server/.env y agregar:
ADMIN_EMAILS=tu-email@ejemplo.com

# 2. Reiniciar servidor backend
cd server
npm run dev

# 3. Iniciar sesión con ese email
# 4. Ir a http://localhost:3000/admin
```

## 🔒 Seguridad

- **Nunca** subas el archivo `.env` a Git (ya está en `.gitignore`)
- Usa emails reales que puedas controlar
- En producción, considera usar un sistema de roles más robusto
- Cambia los emails de admin regularmente si es necesario

