# ⚡ Configurar Admin Rápido

## 🚀 Solución Rápida (1 minuto)

### Opción 1: Usando el Script Automático

```bash
cd server
npm run setup-admin tu-email@ejemplo.com
```

**Reemplaza `tu-email@ejemplo.com` con tu email real.**

Luego reinicia el backend:
```bash
npm run dev
```

### Opción 2: Manual

1. **Abre `server/.env`**

2. **Agrega esta línea:**
   ```env
   ADMIN_EMAILS=tu-email@ejemplo.com
   ```

3. **Reemplaza `tu-email@ejemplo.com` con tu email real**

4. **Reinicia el backend:**
   ```bash
   # Detener (Ctrl+C)
   npm run dev
   ```

## ✅ Verificar Configuración

```bash
cd server
npm run check-admin
```

Esto te mostrará si `ADMIN_EMAILS` está configurado correctamente.

## 🔍 Si el Error Persiste

1. **Verifica que el archivo existe:**
   ```bash
   cd server
   Test-Path .env
   ```

2. **Verifica el contenido:**
   ```bash
   Get-Content .env | Select-String -Pattern "ADMIN_EMAILS"
   ```

3. **Verifica que reiniciaste el backend:**
   - El backend debe estar corriendo
   - Debe haberse iniciado DESPUÉS de modificar `.env`

4. **Verifica que el email coincide:**
   - El email en `ADMIN_EMAILS` debe ser exactamente el mismo que usas para iniciar sesión

## 📋 Ejemplo Completo

```bash
# 1. Ir al directorio del servidor
cd server

# 2. Configurar admin (reemplaza con tu email)
npm run setup-admin admin@go2motion.com

# 3. Verificar que está configurado
npm run check-admin

# 4. Reiniciar el servidor
npm run dev
```

## 🎯 Resultado Esperado

Después de configurar correctamente:
- ✅ El script mostrará: `✅ ADMIN_EMAILS está configurado`
- ✅ El backend no mostrará warnings
- ✅ Podrás acceder a `/admin` sin errores
- ✅ El link "Admin" aparecerá en el navbar

