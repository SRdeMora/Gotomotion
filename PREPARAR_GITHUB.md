# 📦 Preparar Código para GitHub

## ✅ Verificación Rápida

Antes de subir a GitHub, asegúrate de que:

- [ ] El código funciona localmente
- [ ] Los archivos `.env` están en `.gitignore` (NO se subirán)
- [ ] Los archivos de base de datos (`*.db`) están en `.gitignore`
- [ ] `node_modules/` está en `.gitignore`

## 🚀 Pasos para Subir a GitHub

### Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en **"New"** (botón verde)
3. Configura:
   - **Repository name**: `go2motion-awards` (o el nombre que quieras)
   - **Description**: "Go2Motion Awards - Plataforma de concursos de videoclips"
   - **Visibility**: Puede ser **Private** (recomendado para proyectos de clientes)
   - **NO marques** "Initialize with README" (ya tienes archivos)
4. Haz clic en **"Create repository"**

### Paso 2: Subir tu Código

**Si ya tienes Git inicializado localmente:**

```bash
# Verificar que estás en la raíz del proyecto
cd C:\Users\samue\Documents\Proyectos\Mayte

# Agregar todos los archivos (excepto los que están en .gitignore)
git add .

# Hacer commit
git commit -m "Preparado para despliegue automático en Render"

# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git push -u origin main
```

**Si NO tienes Git inicializado:**

```bash
# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Código inicial - Go2Motion Awards"

# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git push -u origin main
```

### Paso 3: Verificar que se Subió Correctamente

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. **IMPORTANTE**: Verifica que NO aparezcan:
   - ❌ Archivos `.env`
   - ❌ Archivos `*.db`
   - ❌ Carpeta `node_modules/`

## ✅ Archivos que SÍ deben estar en GitHub

- ✅ Todo el código fuente (`.ts`, `.tsx`, `.js`, etc.)
- ✅ `package.json` y `package-lock.json`
- ✅ `render.yaml` (configuración de Render)
- ✅ `scripts/` (scripts de build)
- ✅ `server/prisma/schema.prisma` y schemas relacionados
- ✅ Archivos de configuración (`.gitignore`, `tsconfig.json`, etc.)
- ✅ Documentación (`.md` files)

## ❌ Archivos que NO deben estar en GitHub

- ❌ `.env` y `server/.env` (tienen contraseñas)
- ❌ `*.db` (bases de datos locales)
- ❌ `node_modules/` (se instalan automáticamente)
- ❌ `dist/` (se genera automáticamente)

## 🔒 Seguridad

**NUNCA subas archivos `.env` a GitHub.** Contienen:
- Contraseñas de base de datos
- Claves secretas (JWT_SECRET)
- Credenciales de Cloudinary
- Etc.

Estos se configuran directamente en Render después.

## 🎯 Después de Subir a GitHub

Una vez que el código esté en GitHub:

1. Ve a Render
2. Conecta tu cuenta de GitHub
3. Selecciona tu repositorio
4. Render detectará automáticamente `render.yaml`
5. Todo se desplegará automáticamente

## 📝 Comandos Rápidos

```bash
# Ver estado de Git
git status

# Ver qué archivos se van a subir
git status --short

# Si ves archivos que NO deberían subirse, agrégalos a .gitignore
# Luego:
git add .gitignore
git commit -m "Actualizar .gitignore"
```

## ✅ Checklist Final

Antes de hacer push:

- [ ] `git status` no muestra archivos `.env`
- [ ] `git status` no muestra archivos `*.db`
- [ ] `git status` no muestra `node_modules/`
- [ ] Todos los archivos de código están listos
- [ ] `render.yaml` está en la raíz
- [ ] Scripts en `scripts/` están presentes

**¡Listo para subir!** 🚀

