# ⚠️ SQLite en Render: ¿Es Posible?

## 🚨 Problema Principal: Sistema de Archivos Efímero

**Render tiene un sistema de archivos EFÍMERO**. Esto significa:

- ❌ Cualquier archivo que guardes en el servidor se **BORRA** cuando:
  - El servidor se reinicia (automáticamente cada cierto tiempo)
  - Haces un cambio en el código y redeployas
  - Render reinicia el servicio por mantenimiento

- ❌ **SQLite guarda los datos en un archivo** (`dev.db`)
- ❌ **Ese archivo se perdería** cada vez que Render reinicie el servidor
- ❌ **Todos los datos se borrarían** (usuarios, videos, votos, etc.)

## 🤔 ¿Puede Funcionar para una Demo Rápida?

**Técnicamente SÍ, pero con riesgos:**

### ✅ Funcionaría si:
- La demo es muy corta (menos de 15 minutos)
- No importa perder los datos después
- Solo quieres mostrar la funcionalidad, no datos persistentes
- El servidor no se reinicia durante la demo

### ❌ NO funcionaría si:
- La demo dura más de 15 minutos (Render puede reiniciar)
- Quieres que el cliente vea datos persistentes
- Quieres que funcione de forma confiable
- Necesitas que sea profesional

## 💡 Recomendación: PostgreSQL (Gratis y Mejor)

**PostgreSQL en Render es GRATIS** y es la mejor opción porque:

- ✅ Los datos persisten permanentemente
- ✅ No se borran cuando el servidor se reinicia
- ✅ Es más profesional para mostrar al cliente
- ✅ Funciona de forma confiable
- ✅ Es gratis en el plan Free

**Configurar PostgreSQL toma solo 5 minutos más** y vale totalmente la pena.

## 🔧 Si Aún Quieres Intentar SQLite (No Recomendado)

Si realmente quieres intentarlo para una demo muy rápida:

### Paso 1: Modificar el Build Command

En Render, cambia el Build Command del backend a:

```bash
npm install && npm run db:switch-sqlite && npm run db:generate && npm run build
```

### Paso 2: No Necesitas DATABASE_URL

No necesitas configurar `DATABASE_URL` porque SQLite usa un archivo local.

### Paso 3: Advertencias Importantes

⚠️ **ADVIERTE AL CLIENTE** que:
- Los datos se borrarán cuando el servidor se reinicie
- Es solo para demostración de funcionalidad
- No es un entorno de producción

⚠️ **Problemas que enfrentarás:**
- Si Render reinicia el servidor durante la demo → Se pierden todos los datos
- Si haces un cambio y redeployas → Se pierden todos los datos
- Si el servidor se "duerme" (plan Free) → Puede perder datos al despertar

## 📊 Comparación Rápida

| Característica | SQLite en Render | PostgreSQL en Render |
|----------------|------------------|----------------------|
| **Configuración** | Más rápida (5 min) | Un poco más lenta (10 min) |
| **Datos persistentes** | ❌ NO (se borran) | ✅ SÍ (permanecen) |
| **Confiabilidad** | ❌ Baja | ✅ Alta |
| **Profesional** | ❌ NO | ✅ SÍ |
| **Costo** | Gratis | Gratis |
| **Riesgo de pérdida de datos** | ⚠️ ALTO | ✅ Bajo |

## ✅ Mi Recomendación Final

**Usa PostgreSQL**. Es gratis, toma solo 5 minutos más configurarlo, y es mucho más profesional para mostrar al cliente. SQLite solo tiene sentido si:

1. La demo es extremadamente corta (< 10 minutos)
2. No importa perder los datos
3. Solo quieres mostrar funcionalidad, no datos reales

**Para una demo profesional al cliente, PostgreSQL es la única opción sensata.**

## 🚀 Guía Rápida: PostgreSQL en Render (5 minutos)

1. **Crea PostgreSQL en Render** (2 min)
   - New + → PostgreSQL
   - Plan: Free
   - Copia la Internal Database URL

2. **Configura el Backend** (2 min)
   - Build Command: `npm install && npm run db:switch-postgresql && npm run db:generate && npm run build`
   - Variable `DATABASE_URL`: Pega la Internal Database URL

3. **Ejecuta migraciones** (1 min)
   - Shell del backend → `npm run db:push`

**¡Listo!** Tienes una base de datos profesional y confiable.

