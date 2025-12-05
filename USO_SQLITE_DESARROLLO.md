# 🗄️ Uso de SQLite para Desarrollo Local

## ⚠️ IMPORTANTE

**SQLite está COMPLETAMENTE AISLADO del proyecto principal:**
- ✅ El schema principal (`schema.prisma`) siempre usa PostgreSQL
- ✅ SQLite solo se usa temporalmente para desarrollo local
- ✅ Al desplegar, automáticamente usará PostgreSQL
- ✅ No hay riesgo de conflictos en producción

## 🚀 Cambiar a SQLite (Desarrollo)

### Paso 1: Cambiar a SQLite

```bash
cd server
npm run db:switch-sqlite
```

Esto:
- Crea un backup del schema de PostgreSQL
- Cambia temporalmente a SQLite
- Prepara todo para desarrollo local

### Paso 2: Aplicar Esquema

```bash
npm run db:push
```

Esto creará `prisma/dev.db` (archivo SQLite local)

### Paso 3: Reiniciar Backend

```bash
npm run dev
```

### Paso 4: Probar

Intenta registrarte/iniciar sesión. Debería funcionar sin necesidad de PostgreSQL.

## 🔄 Volver a PostgreSQL (Producción)

### Cuando quieras volver a PostgreSQL:

```bash
cd server
npm run db:switch-postgresql
```

Esto:
- Restaura el schema original de PostgreSQL
- Elimina los cambios de SQLite
- Prepara para producción

### Luego configura PostgreSQL:

1. **Configura `server/.env`:**
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/go2motion"
   ```

2. **Aplica el esquema:**
   ```bash
   npm run db:push
   ```

3. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

## 📁 Estructura de Archivos

```
server/
├── prisma/
│   ├── schema.prisma              ← Schema principal (PostgreSQL)
│   ├── schema.sqlite.prisma       ← Schema para SQLite (solo desarrollo)
│   └── schema.postgresql.prisma.backup  ← Backup automático
├── scripts/
│   ├── switch-to-sqlite.js        ← Script para cambiar a SQLite
│   └── switch-to-postgresql.js    ← Script para volver a PostgreSQL
└── .gitignore                      ← Ignora dev.db (SQLite)
```

## ✅ Ventajas de Este Enfoque

1. **Aislamiento completo:** SQLite nunca afecta el schema de producción
2. **Fácil cambio:** Un comando para cambiar entre SQLite y PostgreSQL
3. **Sin conflictos:** El schema principal siempre está listo para PostgreSQL
4. **Desarrollo rápido:** No necesitas instalar PostgreSQL para probar
5. **Producción segura:** Al desplegar, automáticamente usa PostgreSQL

## 🔍 Verificar qué Base de Datos Estás Usando

**Mira `server/prisma/schema.prisma`:**

**Si dice `provider = "sqlite"`:**
- Estás usando SQLite (desarrollo local)

**Si dice `provider = "postgresql"`:**
- Estás usando PostgreSQL (producción)

## 📋 Checklist para Despliegue

Antes de desplegar a producción:

- [ ] Ejecutar `npm run db:switch-postgresql`
- [ ] Verificar que `schema.prisma` tiene `provider = "postgresql"`
- [ ] Configurar `DATABASE_URL` en producción
- [ ] Ejecutar `npm run db:push` en producción
- [ ] Verificar que funciona correctamente

## 🐛 Solución de Problemas

### Error: "No se encontró el backup"
Si perdiste el backup del schema de PostgreSQL:
1. El schema original está en el repositorio Git
2. Restaura desde Git: `git checkout server/prisma/schema.prisma`
3. O copia manualmente desde `schema.sqlite.prisma` y cambia el provider

### Error: "dev.db está bloqueado"
SQLite solo permite una conexión a la vez:
1. Cierra Prisma Studio si está abierto
2. Detén el servidor backend
3. Vuelve a intentar

### Quiero empezar de nuevo con SQLite
```bash
cd server
rm prisma/dev.db  # Eliminar base de datos SQLite
npm run db:push   # Crear nueva base de datos
```

## 💡 Recomendaciones

- **Desarrollo local:** Usa SQLite para velocidad
- **Testing:** Usa SQLite para tests rápidos
- **Producción:** Siempre PostgreSQL
- **Antes de commit:** Verifica que estás en PostgreSQL si vas a hacer cambios al schema

