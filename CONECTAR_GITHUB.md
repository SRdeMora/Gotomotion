# 🔗 Conectar con GitHub

## Tu usuario de GitHub: SRdeMora

## Pasos para conectar:

### 1. Crear repositorio en GitHub (si no lo has hecho)

1. Ve a [github.com](https://github.com)
2. Haz clic en **"New"** (botón verde)
3. Nombre del repositorio: `go2motion-awards` (o el que prefieras)
4. Puede ser **Private**
5. **NO marques** "Initialize with README"
6. Haz clic en **"Create repository"**

### 2. Conectar tu repositorio local con GitHub

Ejecuta estos comandos (reemplaza `NOMBRE_DEL_REPO` con el nombre que pusiste en GitHub):

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/SRdeMora/NOMBRE_DEL_REPO.git

# Verificar que se agregó correctamente
git remote -v

# Subir a GitHub (si tu rama se llama "master")
git push -u origin master

# O si tu rama se llama "main"
git push -u origin main
```

### 3. Si GitHub te pide autenticación

Si te pide usuario/contraseña:
- **Usuario**: SRdeMora
- **Contraseña**: Usa un **Personal Access Token** (no tu contraseña normal)

**Para crear un Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Selecciona: `repo` (todos los permisos)
4. Copia el token y úsalo como contraseña

## ✅ Después de conectar

Una vez que el código esté en GitHub:
1. Ve a Render
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio
4. Render detectará automáticamente `render.yaml`
5. Todo se desplegará automáticamente

