# 🗄️ Configurar Base de Datos - Guía Rápida

## ⚠️ Problema Actual

El backend está intentando conectarse a PostgreSQL pero no está configurado. Por eso obtienes error 500 al intentar registrarte o iniciar sesión.

## ✅ Solución Rápida

Tienes **3 opciones**:

### Opción 1: PostgreSQL Local (Recomendado para Producción)

**1. Instalar PostgreSQL:**
- Windows: Descarga desde https://www.postgresql.org/download/windows/
- O usa Chocolatey: `choco install postgresql`

**2. Crear base de datos:**
```sql
-- Abre psql o pgAdmin
CREATE DATABASE go2motion;
```

**3. Configurar `server/.env`:**
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/go2motion?schema=public"
```

**4. Aplicar esquema:**
```bash
cd server
npm run db:push
```

### Opción 2: PostgreSQL en la Nube (Más Fácil)

**1. Crear cuenta gratuita en:**
- **Supabase** (recomendado): https://supabase.com
- **Railway**: https://railway.app
- **Neon**: https://neon.tech

**2. Crear proyecto y copiar la URL de conexión**

**3. Configurar `server/.env`:**
```env
DATABASE_URL="postgresql://usuario:password@host:5432/database?schema=public"
```

**4. Aplicar esquema:**
```bash
cd server
npm run db:push
```

### Opción 3: SQLite (Más Rápido para Desarrollo)

**1. Cambiar `server/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**2. Aplicar esquema:**
```bash
cd server
npm run db:push
```

**3. Reiniciar backend**

## 🚀 Pasos Rápidos (Supabase - Recomendado)

**1. Crear cuenta en Supabase:**
- Ve a https://supabase.com
- Crea un proyecto nuevo
- Ve a Settings → Database
- Copia la "Connection string" (URI)

**2. Configurar `server/.env`:**
```env
DATABASE_URL="postgresql://postgres.xxxxx:[TU_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

**3. Aplicar esquema:**
```bash
cd server
npm run db:push
```

**4. Reiniciar backend:**
```bash
npm run dev
```

## 📋 Verificación

**Después de configurar, prueba:**
```bash
# Verificar conexión
cd server
npm run db:studio
# Debería abrir Prisma Studio si la conexión funciona
```

## ⚡ Solución Más Rápida (SQLite)

Si solo quieres probar rápido sin instalar nada:

**1. Edita `server/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**2. Ejecuta:**
```bash
cd server
npm run db:push
```

**3. Reinicia el backend**

SQLite creará un archivo `dev.db` localmente, no necesitas instalar nada.

## 🔍 Verificar que Funciona

**Después de configurar la base de datos:**

1. **Reinicia el backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Intenta registrarte/iniciar sesión en el frontend**

3. **Debería funcionar sin errores 500**

## 💡 Recomendación

Para desarrollo rápido: **Usa SQLite** (Opción 3)
Para producción: **Usa PostgreSQL en la nube** (Opción 2 - Supabase)

