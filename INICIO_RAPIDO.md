# 🚀 Inicio Rápido del Frontend

## Problema: No se muestran los mensajes de Vite

Si cuando ejecutas `npm run dev` no ves los mensajes de inicio, sigue estos pasos:

## ✅ Solución Rápida

### Opción 1: Usar el Script PowerShell

```powershell
# Ejecuta este script que verifica todo automáticamente
.\iniciar-frontend.ps1
```

### Opción 2: Pasos Manuales

**1. Verificar que estás en el directorio correcto:**
```powershell
# Deberías ver package.json
dir package.json
```

**2. Verificar dependencias:**
```powershell
# Si no existe node_modules, instalar
npm install
```

**3. Iniciar servidor:**
```powershell
npm run dev
```

**4. Esperar 10-15 segundos** - Vite puede tardar en compilar la primera vez

## 🔍 Qué Deberías Ver

Después de ejecutar `npm run dev`, deberías ver:

```
  VITE v6.4.1  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.130:3000/
  ➜  press h + enter to show help
```

## ⚠️ Si No Aparece Nada

### 1. Verificar Errores

Revisa si hay mensajes de error en rojo. Errores comunes:

- `Cannot find module` → Ejecuta `npm install`
- `Port 3000 is already in use` → Cambia el puerto o cierra el proceso
- `SyntaxError` → Hay un error de sintaxis en algún archivo

### 2. Verificar Puerto

El puerto 3000 podría estar ocupado:

```powershell
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000
```

Si está ocupado, puedes:
- Cerrar el proceso que lo usa
- Cambiar el puerto en `vite.config.ts` (línea 9)

### 3. Limpiar e Reinstalar

```powershell
# Limpiar cache
npm cache clean --force

# Eliminar node_modules
rmdir /s /q node_modules

# Reinstalar
npm install

# Intentar de nuevo
npm run dev
```

### 4. Verificar Versión de Node

```powershell
node --version
# Debería ser v18 o superior
```

## 🎯 Comandos Útiles

```powershell
# Verificar que Vite está instalado
npm list vite

# Ver todos los procesos en el puerto 3000
netstat -ano | findstr :3000

# Matar un proceso (reemplaza PID con el número)
taskkill /PID <PID> /F

# Ver logs completos
npm run dev 2>&1 | Tee-Object -FilePath vite-output.log
```

## 💡 Consejos

1. **Espera unos segundos** - La primera compilación puede tardar
2. **Revisa toda la salida** - Los errores pueden estar al principio
3. **Abre el navegador** - A veces Vite inicia pero hay errores en el navegador
4. **Revisa la consola del navegador** (F12) para ver errores de JavaScript

## 🔄 Si Nada Funciona

1. Cierra todas las terminales
2. Abre una nueva terminal PowerShell como Administrador
3. Ve al directorio del proyecto
4. Ejecuta: `npm run dev`
5. Espera 30 segundos
6. Abre `http://localhost:3000` en el navegador

Si aún no funciona, copia **toda la salida** de la terminal y compártela para diagnóstico.

