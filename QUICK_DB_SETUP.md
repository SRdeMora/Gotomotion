# ⚡ Configuración Rápida de Base de Datos

## 🎯 Opción Más Rápida: SQLite (5 minutos)

### Paso 1: Cambiar a SQLite

**Edita `server/prisma/schema.prisma`:**

Cambia esta línea:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Por esta:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Paso 2: Aplicar Esquema

```bash
cd server
npm run db:push
```

Esto creará un archivo `dev.db` en `server/prisma/`

### Paso 3: Reiniciar Backend

```bash
# Detener (Ctrl+C)
npm run dev
```

### Paso 4: Probar

Intenta registrarte/iniciar sesión. Debería funcionar.

## 🚀 Opción Cloud: Supabase (10 minutos)

### Paso 1: Crear Cuenta

1. Ve a https://supabase.com
2. Crea cuenta gratuita
3. Crea nuevo proyecto
4. Espera a que termine de crear (2-3 minutos)

### Paso 2: Obtener URL de Conexión

1. Ve a Settings → Database
2. Busca "Connection string" → "URI"
3. Copia la URL (parece: `postgresql://postgres.xxx:[PASSWORD]@xxx.supabase.co:5432/postgres`)

### Paso 3: Configurar

**Edita `server/.env`:**
```env
DATABASE_URL="postgresql://postgres.xxx:[TU_PASSWORD]@xxx.supabase.co:5432/postgres"
```

**Reemplaza `[TU_PASSWORD]` con la contraseña que configuraste al crear el proyecto.**

### Paso 4: Aplicar Esquema

```bash
cd server
npm run db:push
```

### Paso 5: Reiniciar

```bash
npm run dev
```

## ✅ Verificar que Funciona

**Después de cualquiera de las opciones:**

1. Intenta registrarte en el frontend
2. Debería funcionar sin error 500
3. Si funciona, la base de datos está configurada correctamente

## 🔄 Cambiar de SQLite a PostgreSQL Después

Si empezaste con SQLite y quieres cambiar a PostgreSQL:

1. Cambia `schema.prisma` de vuelta a `provider = "postgresql"`
2. Configura `DATABASE_URL` en `.env`
3. Ejecuta `npm run db:push`
4. Los datos de SQLite no se migran automáticamente (tendrás que empezar de nuevo)

