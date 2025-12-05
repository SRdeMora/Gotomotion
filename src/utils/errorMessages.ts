/**
 * Convierte mensajes de error técnicos en mensajes amigables para el usuario
 */
export const getFriendlyErrorMessage = (error: any): string => {
  const errorMessage = error?.message || error?.response?.data?.error || error?.response?.data?.message || 'Ha ocurrido un error';

  // Mensajes de error comunes y sus traducciones amigables
  const friendlyMessages: Record<string, string> = {
    // Errores de conexión
    'Failed to fetch': 'No se puede conectar al servidor. Por favor, verifica tu conexión a internet.',
    'Network Error': 'Error de conexión. Por favor, verifica tu conexión a internet.',
    'ECONNREFUSED': 'El servidor no está disponible. Por favor, intenta más tarde.',
    'No se puede conectar al servidor': 'No se puede conectar al servidor. Por favor, verifica tu conexión a internet.',
    
    // Errores de autenticación
    'Token inválido': 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    'Token expirado': 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    'No autorizado': 'No tienes permisos para realizar esta acción.',
    'Unauthorized': 'No tienes permisos para realizar esta acción.',
    
    // Errores de validación comunes
    'Debes seleccionar al menos una categoría': 'Por favor, selecciona al menos una categoría para continuar.',
    'Se requiere thumbnail': 'Por favor, selecciona una imagen de portada para tu video.',
    'Se requiere video': 'Por favor, proporciona un video o un enlace de video.',
    'Formato de categorías inválido': 'Las categorías seleccionadas no son válidas. Por favor, intenta nuevamente.',
    
    // Errores de Cloudinary
    'Cloudinary': 'Error al subir el archivo. Por favor, verifica que el archivo sea válido e intenta nuevamente.',
    'Unknown API key': 'Error de configuración del servidor. Por favor, contacta al administrador.',
    
    // Errores de base de datos
    'Base de datos no disponible': 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.',
    'Error en la base de datos': 'Ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.',
    
    // Errores de votación
    'Ya has votado por otra obra': 'Ya has votado por otra obra en esta categoría. Solo puedes votar una vez por categoría en cada liga.',
    'Ya has votado por este video': 'Ya has votado por este video en esta categoría.',
    
    // Errores de pago
    'Pago no encontrado': 'No se encontró el pago. Por favor, intenta nuevamente.',
    'El pago no ha sido completado': 'El pago no se ha completado. Por favor, completa el proceso de pago.',
    
    // Errores de archivo
    'tamaño': 'El archivo es demasiado grande. Por favor, selecciona un archivo más pequeño.',
    'size': 'El archivo es demasiado grande. Por favor, selecciona un archivo más pequeño.',
    'formato': 'El formato del archivo no es válido. Por favor, usa un formato compatible.',
    'format': 'El formato del archivo no es válido. Por favor, usa un formato compatible.',
    
    // Errores genéricos
    'Error interno del servidor': 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.',
    'Internal Server Error': 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.',
  };

  // Buscar coincidencias parciales en el mensaje de error
  for (const [key, friendlyMessage] of Object.entries(friendlyMessages)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return friendlyMessage;
    }
  }

  // Si no hay coincidencia, devolver el mensaje original pero limpiado
  // Remover información técnica innecesaria
  let cleanedMessage = errorMessage
    .replace(/Error:?\s*/gi, '')
    .replace(/\[.*?\]/g, '') // Remover [TAGS]
    .replace(/at\s+.*/gi, '') // Remover stack traces
    .trim();

  // Si el mensaje está vacío o es muy técnico, usar un mensaje genérico
  if (!cleanedMessage || cleanedMessage.length > 200) {
    return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
  }

  return cleanedMessage;
};

