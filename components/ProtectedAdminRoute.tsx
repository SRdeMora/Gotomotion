import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../src/hooks/useAdmin';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Componente profesional para proteger rutas de administración
 * Verifica permisos antes de renderizar el contenido
 */
const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAdmin, isLoading, error } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permisos de administrador..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-xl border border-red-500/20 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Error de Configuración</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="bg-darker p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-400 mb-2">Para solucionar:</p>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
              <li>Abre el archivo <code className="bg-black/30 px-2 py-1 rounded">server/.env</code></li>
              <li>Agrega la línea: <code className="bg-black/30 px-2 py-1 rounded">ADMIN_EMAILS=tu-email@ejemplo.com</code></li>
              <li>Reemplaza <code className="bg-black/30 px-2 py-1 rounded">tu-email@ejemplo.com</code> con tu email real</li>
              <li>Reinicia el servidor backend</li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <a
              href="/"
              className="inline-block bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Volver al Inicio
            </a>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="bg-card p-8 rounded-xl border border-red-500/20 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Acceso Denegado</h2>
          <p className="text-gray-300 mb-2">
            No tienes permisos para acceder al panel de administración.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
          <a
            href="/"
            className="inline-block bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;

