import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Página no encontrada</h2>
        <p className="text-gray-400 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home size={20} />
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-card hover:bg-white/5 border border-white/10 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

