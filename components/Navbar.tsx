import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogIn } from 'lucide-react';
import { User } from '../types';
import { useAdmin } from '../src/hooks/useAdmin';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, isLoading } = useAdmin();

  const navLinks = [
    { name: 'Concurso', path: '/contest' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Cómo Participar', path: '/how-it-works' },
    { name: 'Jurado', path: '/#jury' }, // Anchor link
    { name: 'Foro', path: '/forum' },
  ];

  // Agregar link de admin si el usuario es admin (verificación profesional)
  // Solo mostrar después de que termine la carga para evitar parpadeos
  // DEBUG: Log para ver qué está pasando
  if (!isLoading) {
    console.log('[NAVBAR] Estado admin:', { isAdmin, isLoading, userEmail: user?.email });
  }
  
  if (!isLoading && isAdmin && user) {
    navLinks.push({ name: 'Admin', path: '/admin' });
    console.log('[NAVBAR] Agregando link Admin a la navegación');
  } else if (!isLoading && user) {
    console.log('[NAVBAR] NO se agrega Admin porque:', { isAdmin, isLoading, tieneUser: !!user });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-darker/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent tracking-tighter">
                GO2MOTION
              </span>
              <span className="text-white font-light hidden sm:inline-block">AWARDS</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-secondary bg-white/5'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                  <img src={user.avatar} alt="Profile" className="h-8 w-8 rounded-full border border-gray-600" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={onLogout}
                  className="text-xs border border-red-500/50 text-red-400 hover:bg-red-500/10 px-3 py-1 rounded"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/25"
              >
                <LogIn size={16} />
                Entrar / Registro
              </Link>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                   isActive(link.path) ? 'text-secondary bg-black/20' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <img src={user.avatar} alt="Profile" className="h-8 w-8 rounded-full border border-gray-600" />
                  <span>Mi Perfil ({user.name})</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border-t border-white/10 mt-2 pt-3"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary hover:bg-indigo-600 text-white text-center mt-2"
              >
                Iniciar Sesión / Registro
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;