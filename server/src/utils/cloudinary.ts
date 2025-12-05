import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Verificar si Cloudinary está configurado con valores reales (no de ejemplo)
const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  // Verificar que existan y no sean valores de ejemplo
  const hasValidValues = 
    cloudName && 
    apiKey && 
    apiSecret &&
    !cloudName.includes('tu_') &&
    !cloudName.includes('aqui') &&
    !apiKey.includes('tu_') &&
    !apiKey.includes('aqui') &&
    !apiSecret.includes('tu_') &&
    !apiSecret.includes('aqui');
  
  return hasValidValues;
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️  Cloudinary no está configurado. Las subidas de archivos fallarán.');
  console.warn('⚠️  Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en server/.env');
}

// Función alternativa para desarrollo: convertir imagen a base64
const uploadToBase64 = async (
  file: Express.Multer.File
): Promise<{ url: string; public_id: string }> => {
  const base64 = file.buffer.toString('base64');
  const mimeType = file.mimetype || 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${base64}`;
  
  return {
    url: dataUrl,
    public_id: `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  };
};

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'go2motion'
): Promise<{ url: string; public_id: string }> => {
  // Verificar configuración
  if (!isCloudinaryConfigured()) {
    console.warn('⚠️  Cloudinary no está configurado. Usando almacenamiento temporal (base64).');
    console.warn('⚠️  Para producción, configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Render');
    
    // Usar base64 como alternativa (funciona en desarrollo y producción para demo)
    return uploadToBase64(file);
  }

  // Validar que el archivo tenga buffer
  if (!file.buffer) {
    throw new Error('El archivo no tiene buffer. Verifica la configuración de multer.');
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov'],
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error de Cloudinary:', error);
            console.warn('⚠️  Cloudinary falló. Usando almacenamiento temporal (base64) como fallback.');
            
            // Si Cloudinary falla, usar base64 como fallback
            uploadToBase64(file)
              .then(resolve)
              .catch(reject);
          } else if (result) {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            // Si no hay resultado, usar base64 como fallback
            console.warn('⚠️  Cloudinary no devolvió resultado. Usando base64 como fallback.');
            uploadToBase64(file)
              .then(resolve)
              .catch(reject);
          }
        }
      );

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    } catch (error: any) {
      console.error('❌ Error al crear stream de Cloudinary:', error);
      console.warn('⚠️  Usando base64 como fallback debido a error.');
      
      // Si hay error al crear el stream, usar base64 como fallback
      uploadToBase64(file)
        .then(resolve)
        .catch(reject);
    }
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

