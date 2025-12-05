# 🔄 Solución: Código Cacheado en el Navegador

## 🔍 Problema

Si ves mensajes de error que mencionan el puerto 5000 pero ya actualizaste el código a 3001, probablemente el navegador tiene el código anterior cacheado.

## ✅ Solución Rápida

### 1. Limpiar Cache del Navegador

**Chrome/Edge:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Caché de imágenes y archivos"
3. Haz clic en "Borrar datos"

**O más rápido:**
- Presiona `Ctrl + Shift + R` (recarga forzada)
- O `Ctrl + F5`

**Firefox:**
- Presiona `Ctrl + Shift + R`
- O `Ctrl + F5`

### 2. Reiniciar el Servidor del Frontend

**Importante:** Después de cambiar el código, **SIEMPRE** reinicia el servidor:

```bash
# Detener el servidor (Ctrl+C)
# Volver a iniciar
npm run dev
```

### 3. Verificar que los Cambios se Aplicaron

**Abre la consola del navegador (F12) y ejecuta:**
```javascript
// Verificar la URL de la API
console.log(import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
```

Debería mostrar: `http://localhost:3001/api` (o la URL que configuraste)

### 4. Verificar el Archivo .env

**Asegúrate de que `.env` en la raíz tiene:**
```env
VITE_API_URL=http://localhost:3001
```

**Y reinicia el servidor del frontend después de cambiar `.env`**

## 🔄 Pasos Completos

```bash
# 1. Detener servidor frontend (Ctrl+C)

# 2. Verificar .env
# Asegúrate de que tiene: VITE_API_URL=http://localhost:3001

# 3. Reiniciar frontend
npm run dev

# 4. En el navegador:
# - Presiona Ctrl + Shift + R (recarga forzada)
# - O limpia el cache completamente
```

## 💡 Verificación

**Después de reiniciar, verifica:**

1. **En la terminal del frontend:** Debería mostrar `Local: http://localhost:3000/`
2. **En el navegador (F12 → Console):**
   ```javascript
   fetch('/api/health').then(r => r.json()).then(console.log)
   ```
   Debería intentar conectar a `http://localhost:3001/api/health`

3. **Mensajes de error:** Ahora deberían mencionar el puerto 3001, no 5000

## 🐛 Si Sigue Mostrando 5000

1. **Cierra completamente el navegador** y vuelve a abrirlo
2. **Abre en modo incógnito** para evitar cache
3. **Verifica que el código está actualizado:**
   ```bash
   # Ver el contenido del archivo
   cat src/services/api.ts | grep "localhost"
   ```
   Debería mostrar `localhost:3001`

4. **Verifica que Vite recompiló:**
   - Deberías ver mensajes de compilación en la terminal
   - Si no ves cambios, puede haber un error de sintaxis

## 📋 Checklist

- [ ] Archivo `.env` tiene `VITE_API_URL=http://localhost:3001`
- [ ] Servidor frontend reiniciado después de cambiar `.env`
- [ ] Cache del navegador limpiado (Ctrl + Shift + R)
- [ ] Navegador cerrado y vuelto a abrir (si es necesario)
- [ ] Código actualizado en `src/services/api.ts`
- [ ] Código actualizado en `vite.config.ts`

