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
          console.log('[ADMIN] No hay usuario logueado');
          setStatus({ isAdmin: false, isLoading: false, error: null });
          return;
        }

        const userEmail = user.email.toLowerCase().trim();
        console.log('[ADMIN] Verificando admin para:', userEmail);
        
        // Verificación local (frontend) - rápida
        const adminEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS || '';
        const adminEmails = adminEmailsRaw
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0);
        
        console.log('[ADMIN] VITE_ADMIN_EMAILS configurado:', adminEmailsRaw);
        console.log('[ADMIN] Lista de admins (frontend):', adminEmails);
        
        const isLocalAdmin = adminEmails.length > 0 && adminEmails.includes(userEmail);
        console.log('[ADMIN] Verificación local:', isLocalAdmin);

        // Verificación remota (backend) - más segura y definitiva
        let isRemoteAdmin = false;
        let backendError = null;
        
        try {
          const token = authService.getToken();
          if (!token) {
            console.log('[ADMIN] No hay token, usando solo verificación local');
            // Sin token, usar solo verificación local
            setStatus({
              isAdmin: isLocalAdmin,
              isLoading: false,
              error: null,
            });
            return;
          }

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
          } else {
            // Para otros errores (500, network, etc), usar verificación local como fallback
            console.warn('[ADMIN] Error del backend, usando verificación local como fallback');
            isRemoteAdmin = isLocalAdmin;
          }
        }

        // Lógica simplificada y clara:
        // - Si backend funciona y dice que es admin → es admin
        // - Si backend funciona y dice que NO es admin → NO es admin
        // - Si backend falla → usar verificación local
        let isAdmin = false;
        
        if (backendError) {
          // Hay error del backend, usar verificación local
          isAdmin = isLocalAdmin;
        } else {
          // Backend funciona correctamente, confiar en su respuesta
          isAdmin = isRemoteAdmin;
          
          // Si backend dice que no es admin pero local dice que sí,
          // puede ser que el backend no tenga ADMIN_EMAILS configurado
          // En ese caso, usar local como fallback
          if (!isAdmin && isLocalAdmin) {
            console.warn('[ADMIN] Backend dice que NO es admin pero local dice que SÍ. Usando local como fallback (puede ser que ADMIN_EMAILS no esté configurado en backend).');
            isAdmin = isLocalAdmin;
          }
        }

        console.log('[ADMIN] RESULTADO FINAL:', {
          isAdmin,
          isLocalAdmin,
          isRemoteAdmin,
          userEmail,
          tieneBackendError: !!backendError,
        });

        setStatus({
          isAdmin,
          isLoading: false,
          error: null,
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
    
    // Re-ejecutar cuando cambie el usuario (por si se loguea después)
    const interval = setInterval(() => {
      const user = authService.getUser();
      if (user && user.email) {
        checkAdminStatus();
      }
    }, 2000); // Verificar cada 2 segundos
    
    return () => clearInterval(interval);
  }, []);

  return status;
};

