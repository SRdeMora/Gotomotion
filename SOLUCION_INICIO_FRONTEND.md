# 🔧 Solución: Frontend No Inicia Correctamente

## 🔍 Diagnóstico

Si cuando ejecutas `npm run dev` no ves los mensajes de Vite (Local, Network, etc.), puede ser por varias razones:

## ✅ Soluciones Paso a Paso

### 1. Verificar que Estás en el Directorio Correcto

Asegúrate de estar en la **raíz del proyecto** (no en `server/`):

```bash
# Deberías estar aquí:
C:\Users\samue\Documents\Proyectos\Mayte>

# NO aquí:
C:\Users\samue\Documents\Proyectos\Mayte\server>
```

### 2. Verificar Dependencias Instaladas

```bash
# Verificar que node_modules existe
dir node_modules

# Si no existe, instalar dependencias
npm install
```

### 3. Limpiar Cache y Reinstalar

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstalar
npm install
```

### 4. Verificar Errores de Compilación

Ejecuta el servidor y **espera unos segundos** para ver si hay errores:

```bash
npm run dev
```

**Busca mensajes de error en rojo** que puedan indicar:
- Errores de importación
- Errores de sintaxis
- Archivos faltantes

### 5. Verificar Archivos Críticos

Asegúrate de que estos archivos existen:
- ✅ `index.html`
- ✅ `index.tsx`
- ✅ `App.tsx`
- ✅ `vite.config.ts`
- ✅ `package.json`

### 6. Verificar Puerto 3000 Disponible

El puerto 3000 podría estar ocupado:

```bash
# Verificar qué está usando el puerto 3000
netstat -ano | findstr :3000

# Si está ocupado, puedes cambiar el puerto en vite.config.ts
```

### 7. Ejecutar con Más Verbosidad

Intenta ejecutar con más información:

```bash
# En Windows PowerShell
$env:DEBUG="*"; npm run dev

# O simplemente espera más tiempo
npm run dev
```

### 8. Verificar Errores Específicos

Si ves algún error específico, busca en la consola:

**Errores comunes:**
- `Cannot find module` → Falta instalar dependencias
- `Port 3000 is already in use` → Puerto ocupado
- `SyntaxError` → Error de sintaxis en algún archivo
- `Failed to resolve import` → Import incorrecto

## 🚀 Solución Rápida

**Ejecuta estos comandos en orden:**

```bash
# 1. Ir a la raíz del proyecto
cd C:\Users\samue\Documents\Proyectos\Mayte

# 2. Limpiar e instalar
npm cache clean --force
npm install

# 3. Iniciar servidor
npm run dev
```

**Deberías ver:**
```
  VITE v6.2.0  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.130:3000/
  ➜  press h + enter to show help
```

## 🐛 Si Sigue Sin Funcionar

### Verificar Logs Completos

Ejecuta y **copia toda la salida** (incluyendo errores):

```bash
npm run dev 2>&1 | Tee-Object -FilePath output.log
```

Luego revisa `output.log` para ver qué está pasando.

### Verificar Versión de Node

```bash
node --version
# Debería ser v18 o superior

npm --version
# Debería ser v9 o superior
```

### Reinstalar Vite

```bash
npm uninstall vite @vitejs/plugin-react
npm install vite @vitejs/plugin-react --save-dev
```

## 📋 Checklist de Verificación

Antes de reportar el problema, verifica:

- [ ] Estás en el directorio correcto (raíz del proyecto)
- [ ] `node_modules` existe y está completo
- [ ] `package.json` existe y tiene los scripts correctos
- [ ] `vite.config.ts` existe y está bien formado
- [ ] Puerto 3000 no está ocupado
- [ ] Node.js está instalado y actualizado
- [ ] No hay errores de sintaxis en los archivos
- [ ] Has ejecutado `npm install` recientemente

## 💡 Consejos

1. **Espera unos segundos** después de ejecutar `npm run dev` - Vite puede tardar en compilar
2. **Revisa toda la salida** - Los errores pueden estar al principio
3. **Abre otra terminal** - A veces la salida se muestra en otra ventana
4. **Verifica el navegador** - A veces Vite inicia pero hay errores en el navegador

## 🔄 Alternativa: Usar Puerto Diferente

Si el puerto 3000 está ocupado, puedes cambiar el puerto en `vite.config.ts`:

```typescript
server: {
  port: 3001, // Cambiar a otro puerto
  host: '0.0.0.0',
  ...
}
```

Luego accede a `http://localhost:3001`

