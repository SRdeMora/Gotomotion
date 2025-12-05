import React, { useState } from 'react';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';

interface AuthProps {
  onLogin: (role: UserRole, name: string, email: string, password: string, isRegister: boolean) => Promise<void>;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { showError } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VOTER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!name || !email || !password) {
        setError('Por favor, completa todos los campos');
        return;
      }
      
      // Basic validation
      if (name.trim().length < 2) {
        setError('El nombre debe tener al menos 2 caracteres');
        return;
      }
      
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Por favor, introduce un email válido');
        return;
      }
      
      await onLogin(selectedRole, name.trim(), email.trim(), password, isRegister);
      navigate('/profile');
    } catch (err: any) {
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
      showError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title={isRegister ? 'Registro' : 'Iniciar Sesión'} />
      <div className="min-h-screen bg-darker flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-card p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-white">
            {isRegister ? 'Crea tu Cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isRegister ? 'Únete a la comunidad audiovisual' : 'Accede a tu panel de control'}
          </p>
        </div>

        {isRegister && (
           <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                 { role: UserRole.VOTER, label: 'Votante' },
                 { role: UserRole.PARTICIPANT_INDIVIDUAL, label: 'Individual' },
                 { role: UserRole.PARTICIPANT_TEAM, label: 'Equipo' }
              ].map((option) => (
                 <button
                    key={option.role}
                    type="button"
                    onClick={() => setSelectedRole(option.role)}
                    className={`text-xs sm:text-sm py-2 px-1 rounded-lg border transition-all ${
                       selectedRole === option.role 
                       ? 'bg-secondary border-secondary text-white' 
                       : 'bg-transparent border-white/20 text-gray-400 hover:text-white'
                    }`}
                 >
                    {option.label}
                 </button>
              ))}
           </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Nombre Completo / Equipo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-darker focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                placeholder="Nombre Completo o Nombre de Equipo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-darker focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-darker focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-secondary to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary shadow-lg shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Entrar'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-center">
           <button 
             type="button" 
             onClick={() => setIsRegister(!isRegister)}
             className="text-sm text-indigo-400 hover:text-indigo-300"
           >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
           </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Auth;