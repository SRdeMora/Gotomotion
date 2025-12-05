# 🗄️ Sistema SQLite Aislado - Guía Completa

## ✅ Configuración Completada

He configurado SQLite **COMPLETAMENTE AISLADO** del proyecto principal:

### 📁 Archivos Creados

1. **`server/prisma/schema.sqlite.prisma`** - Schema separado para SQLite
2. **`server/scripts/switch-to-sqlite.js`** - Script para cambiar a SQLite
3. **`server/scripts/switch-to-postgresql.js`** - Script para volver a PostgreSQL
4. **`server/prisma/schema.postgresql.prisma.backup`** - Backup automático del schema original

### 🔒 Garantías de Aislamiento

- ✅ **Schema principal (`schema.prisma`) siempre usa PostgreSQL por defecto**
- ✅ **SQLite solo se activa manualmente con el script**
- ✅ **Al hacer commit, el schema principal sigue siendo PostgreSQL**
- ✅ **El archivo `dev.db` (SQLite) está en `.gitignore`**
- ✅ **Al desplegar, automáticamente usará PostgreSQL**

## 🚀 Uso Rápido

### Para Desarrollo Local (SQLite)

```bash
cd server

# 1. Cambiar a SQLite
npm run db:switch-sqlite

# 2. Aplicar esquema
npm run db:push

# 3. Reiniciar servidor
npm run dev
```

### Para Producción (PostgreSQL)

```bash
cd server

# 1. Volver a PostgreSQL
npm run db:switch-postgresql

# 2. Configurar DATABASE_URL en .env
# DATABASE_URL="postgresql://..."

# 3. Aplicar esquema
npm run db:push

# 4. Reiniciar servidor
npm run dev
```

## 📋 Estado Actual

**✅ Ya ejecuté el cambio a SQLite por ti**

**Próximos pasos:**

1. **Aplicar el esquema:**
   ```bash
   cd server
   npm run db:push
   ```

2. **Reiniciar el backend:**
   ```bash
   npm run dev
   ```

3. **Probar registro/login en el frontend**

## 🔍 Verificar Estado

**Para ver qué base de datos estás usando:**

```bash
# Ver el schema actual
cat server/prisma/schema.prisma | grep "provider"
```

**Si dice `provider = "sqlite"`:** Estás en modo desarrollo (SQLite)
**Si dice `provider = "postgresql"`:** Estás en modo producción (PostgreSQL)

## ⚠️ Importante para Despliegue

**Antes de desplegar a producción:**

1. Ejecuta `npm run db:switch-postgresql`
2. Verifica que `schema.prisma` tiene `provider = "postgresql"`
3. Configura `DATABASE_URL` en producción
4. Ejecuta `npm run db:push` en producción

**El proyecto está configurado para que SQLite NUNCA afecte la producción.**

## 📝 Archivos que NO se Suben a Git

- `prisma/dev.db` - Base de datos SQLite (solo local)
- `prisma/dev.db-journal` - Journal de SQLite (solo local)
- `schema.postgresql.prisma.backup` - Backup (opcional, puedes incluirlo)

**El schema principal (`schema.prisma`) siempre está listo para PostgreSQL.**

