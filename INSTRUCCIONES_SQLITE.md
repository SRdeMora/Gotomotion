# ✅ SQLite Configurado - Instrucciones

## 🎉 Estado Actual

**✅ SQLite está configurado y funcionando**

La base de datos `dev.db` se ha creado en `server/prisma/dev.db`

## 🔒 Aislamiento Completo

**SQLite está COMPLETAMENTE AISLADO:**

- ✅ Schema principal (`schema.prisma`) está en modo SQLite temporalmente
- ✅ Backup de PostgreSQL guardado en `schema.postgresql.prisma.backup`
- ✅ Archivo `dev.db` está en `.gitignore` (no se subirá a Git)
- ✅ Al desplegar, automáticamente usará PostgreSQL

## 🚀 Próximos Pasos

### 1. Reiniciar el Backend

```bash
cd server
npm run dev
```

Deberías ver: `Server running on port 5000`

### 2. Probar Registro/Login

Ve al frontend e intenta registrarte o iniciar sesión. Debería funcionar sin errores.

## 🔄 Cambiar Entre SQLite y PostgreSQL

### Para Desarrollo (SQLite)

```bash
cd server
npm run db:switch-sqlite
npm run db:push
npm run dev
```

### Para Producción (PostgreSQL)

```bash
cd server
npm run db:switch-postgresql
# Configurar DATABASE_URL en .env
npm run db:push
npm run dev
```

## 📁 Archivos Importantes

- `server/prisma/schema.prisma` - Schema actual (ahora SQLite)
- `server/prisma/schema.sqlite.prisma` - Schema para SQLite (separado)
- `server/prisma/schema.postgresql.prisma.backup` - Backup de PostgreSQL
- `server/prisma/dev.db` - Base de datos SQLite (local, no se sube a Git)

## ⚠️ Importante para Despliegue

**Antes de desplegar:**

1. Ejecuta `npm run db:switch-postgresql`
2. Verifica que `schema.prisma` tiene `provider = "postgresql"`
3. Configura `DATABASE_URL` en producción
4. Ejecuta `npm run db:push` en producción

**El proyecto está configurado para que SQLite NUNCA afecte la producción.**

## ✅ Verificación

**Para ver qué base de datos estás usando:**

```bash
# Ver el provider actual
cat server/prisma/schema.prisma | grep "provider"
```

**Si dice `provider = "sqlite"`:** Modo desarrollo (SQLite)
**Si dice `provider = "postgresql"`:** Modo producción (PostgreSQL)

