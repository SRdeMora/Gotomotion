# Configuración de Cloudinary

## ¿Qué es Cloudinary?

Cloudinary es un servicio de almacenamiento en la nube para imágenes y videos. Se usa para almacenar las fotos de perfil y otros archivos multimedia de la aplicación.

## Opción 1: Configurar Cloudinary (Recomendado para Producción)

### Paso 1: Crear cuenta en Cloudinary

1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita (tiene un plan gratuito generoso)
3. Una vez registrado, ve al Dashboard

### Paso 2: Obtener las credenciales

En el Dashboard de Cloudinary encontrarás:
- **Cloud Name**: Nombre de tu cuenta (ejemplo: `mi-empresa`)
- **API Key**: Clave de API (ejemplo: `123456789012345`)
- **API Secret**: Secreto de API (ejemplo: `abcdefghijklmnopqrstuvwxyz`)

### Paso 3: Configurar en el proyecto

Abre el archivo `server/.env` y reemplaza los valores de ejemplo:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name_real
CLOUDINARY_API_KEY=tu_api_key_real
CLOUDINARY_API_SECRET=tu_api_secret_real
```

**IMPORTANTE**: Reemplaza `tu_cloud_name_real`, `tu_api_key_real` y `tu_api_secret_real` con tus credenciales reales de Cloudinary.

### Paso 4: Reiniciar el servidor

Después de configurar las variables, reinicia el servidor backend:

```bash
cd server
npm run dev
```

## Opción 2: Modo Desarrollo (Temporal)

Si no quieres configurar Cloudinary ahora, la aplicación usará almacenamiento temporal en base64 para desarrollo. Esto significa que:

- ✅ Las imágenes se guardarán en la base de datos como datos base64
- ✅ Funciona para desarrollo y pruebas
- ⚠️ No es recomendable para producción (las imágenes pueden ser muy grandes)
- ⚠️ Las imágenes se perderán si se reinicia la base de datos

**Nota**: Este modo solo funciona en desarrollo (`NODE_ENV=development`). En producción necesitarás Cloudinary.

## Verificar la configuración

Después de configurar Cloudinary, puedes verificar que funciona correctamente:

1. Intenta subir una foto de perfil
2. Si funciona, verás en la consola del servidor: `✅ [AVATAR] Imagen subida correctamente`
3. Si hay error, verás: `❌ [AVATAR] Error al subir imagen`

## Solución de problemas

### Error: "Unknown API key"

- Verifica que las credenciales en `server/.env` sean correctas
- Asegúrate de que no haya espacios extra al inicio o final
- Reinicia el servidor después de cambiar el `.env`

### Error: "Cloudinary no está configurado"

- Verifica que el archivo `server/.env` exista
- Verifica que las variables tengan los nombres correctos:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### Las imágenes no se muestran

- Verifica que Cloudinary esté configurado correctamente
- Revisa la consola del navegador para ver si hay errores de carga
- En desarrollo, las imágenes base64 pueden tardar en cargarse

## Plan gratuito de Cloudinary

El plan gratuito incluye:
- 25 GB de almacenamiento
- 25 GB de ancho de banda mensual
- Transformaciones de imágenes ilimitadas
- Perfecto para desarrollo y proyectos pequeños

Para más información: [https://cloudinary.com/pricing](https://cloudinary.com/pricing)

