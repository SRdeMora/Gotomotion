# 🔧 Solución: Variables Duplicadas en .env

## 🔍 Problema

Si tienes variables duplicadas en el archivo `.env`, el primero que encuentra es el que se usa. Esto puede causar que uses valores incorrectos.

## ✅ Solución

### Verificar Variables Duplicadas

```bash
# En PowerShell
Get-Content .env | Select-String "VITE_API_URL"
```

Si ves múltiples líneas con la misma variable, necesitas eliminar las duplicadas.

### Limpiar el Archivo .env

**El archivo `.env` debe tener solo UNA línea por variable:**

```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=
VITE_ADMIN_EMAILS=tu-email@ejemplo.com
```

**NO debe tener:**
```env
VITE_API_URL=http://localhost:5000  # ❌ Eliminar esta línea
VITE_API_URL=http://localhost:3001   # ✅ Dejar solo esta
```

### Después de Limpiar

1. **Guarda el archivo `.env`**
2. **Reinicia el servidor del frontend:**
   ```bash
   # Detener (Ctrl+C)
   npm run dev
   ```
3. **Limpia el cache del navegador:** `Ctrl + Shift + R`

## 📋 Formato Correcto del .env

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001

# Optional: Gemini API
GEMINI_API_KEY=

# Admin Emails (para mostrar link Admin en navbar)
VITE_ADMIN_EMAILS=tu-email@ejemplo.com
```

## ⚠️ Importante

- **Una variable = Una línea**
- **No duplicar variables**
- **Reiniciar servidor después de cambiar `.env`**
- **Limpiar cache del navegador**

