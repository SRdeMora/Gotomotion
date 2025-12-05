import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { api } from '../services/api';

interface AdminStatus {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook profesional para verificar si el usuario actual es administrador
 * Verifica tanto en el frontend (VITE_ADMIN_EMAILS) como en el backend (API)
 */
export const useAdmin = (): AdminStatus => {
  const [status, setStatus] = useState<AdminStatus>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = authService.getUser();
        
        if (!user || !user.email) {
          setStatus({ isAdmin: false, isLoading: false, error: null });
          return;
        }

        const userEmail = user.email.toLowerCase().trim();
        
        // Verificación local (frontend) - rápida
        const adminEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS || '';
        const adminEmails = adminEmailsRaw
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0);
        
        const isLocalAdmin = adminEmails.length > 0 && adminEmails.includes(userEmail);

        // Verificación remota (backend) - más segura y definitiva
        let isRemoteAdmin = false;
        let backendError = null;
        
        try {
          const token = authService.getToken();
          if (token) {
            // Usar el endpoint de diagnóstico específico para verificar admin
            const diagnostics = await api.getAdminDiagnostics(token);
            isRemoteAdmin = diagnostics.isAdmin;
            
            // Log detallado para debugging
            console.log('[ADMIN] Verificación backend:', {
              configured: diagnostics.configured,
              userEmail: diagnostics.userEmail,
              adminEmails: diagnostics.adminEmails,
              isAdmin: diagnostics.isAdmin,
              envLoaded: diagnostics.envLoaded,
            });
          } else {
            console.log('[ADMIN] No hay token, solo verificación local');
          }
        } catch (error: any) {
          backendError = error;
          const status = error?.status || error?.response?.status;
          
          console.error('[ADMIN] Error al verificar en backend:', {
            status,
            message: error?.message || error,
            userEmail,
          });
          
          // Si el error es 403, definitivamente no es admin
          if (status === 403) {
            isRemoteAdmin = false;
          } else if (status === 401) {
            // No autenticado
            isRemoteAdmin = false;
          } else if (status === 500) {
            // Error 500 puede ser por configuración faltante en backend
            // En este caso, confiamos en la verificación local
            console.warn('⚠️ Backend retornó error 500. Usando verificación local.');
            isRemoteAdmin = isLocalAdmin;
          } else {
            // Para otros errores (network, etc), confiamos en la verificación local
            isRemoteAdmin = isLocalAdmin;
          }
        }

        // El usuario es admin si pasa la verificación remota O la local
        // Priorizamos la remota si está disponible
        const isAdmin = backendError && backendError.status !== 500 
          ? isRemoteAdmin 
          : (isLocalAdmin || isRemoteAdmin);

        // Si hay error 500 del backend y no hay verificación local, mostrar error útil
        let errorMessage = null;
        if (backendError && (backendError.status === 500 || backendError.response?.status === 500) && !isLocalAdmin) {
          errorMessage = 'El servidor backend no tiene configurado ADMIN_EMAILS. Por favor, configura ADMIN_EMAILS en server/.env y reinicia el servidor.';
        }

        console.log('[ADMIN] Resultado final:', {
          isAdmin,
          isLocalAdmin,
          isRemoteAdmin,
          userEmail,
        });

        setStatus({
          isAdmin,
          isLoading: false,
          error: errorMessage,
        });
      } catch (error: any) {
        console.error('[ADMIN] Error general:', error);
        setStatus({
          isAdmin: false,
          isLoading: false,
          error: error.message || 'Error al verificar permisos de administrador',
        });
      }
    };

    checkAdminStatus();
  }, []);

  return status;
};

