import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import NotFound from './components/NotFound';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { User, UserRole } from './types';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { api } from './src/services/api';
import { authService, StoredUser } from './src/services/auth';
import { getFriendlyErrorMessage } from './src/utils/errorMessages';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Contest = lazy(() => import('./pages/Contest'));
const Ranking = lazy(() => import('./pages/Ranking'));
const Profile = lazy(() => import('./pages/Profile'));
const Forum = lazy(() => import('./pages/Forum'));
const Auth = lazy(() => import('./pages/Auth'));
const VideoDetail = lazy(() => import('./pages/VideoDetail'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Admin = lazy(() => import('./pages/Admin'));
const UploadVideo = lazy(() => import('./pages/UploadVideo'));
const MyVideos = lazy(() => import('./pages/MyVideos'));

const Footer = () => (
  <footer className="bg-darker border-t border-white/5 py-12 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
       <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-2">GO2MOTION</h2>
          <p className="text-gray-500 text-sm">© 2024 Go2Motion Awards. Todos los derechos reservados.</p>
       </div>
       <div className="flex gap-6">
          <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><Instagram size={24} /></a>
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors"><Twitter size={24} /></a>
          <a href="#" aria-label="Email" className="text-gray-400 hover:text-white transition-colors"><Mail size={24} /></a>
       </div>
       <div className="flex gap-4 text-sm text-gray-400">
          <a href="#" className="hover:text-white">Bases Legales</a>
          <a href="#" className="hover:text-white">Privacidad</a>
          <a href="#" className="hover:text-white">Contacto</a>
       </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage and verify token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const response = await api.getCurrentUser(token);
            const userData = response.user;
            const user: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as UserRole,
              avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
              bio: userData.bio,
              sector: userData.sector,
            };
            setUser(user);
            authService.setUser(user);
          } catch (error) {
            // Token invalid, clear storage
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogin = async (role: UserRole, name: string, email: string, password: string, isRegister: boolean) => {
    try {
      let response;
      if (isRegister) {
        response = await api.register({ email, name, password, role });
      } else {
        response = await api.login(email, password);
      }

      const { user: userData, token } = response;
      
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
        bio: userData.bio,
        sector: userData.sector,
      };

      authService.setToken(token);
      authService.setUser(user);
      setUser(user);
    } catch (error: any) {
      const friendlyError = getFriendlyErrorMessage(error);
      throw new Error(friendlyError);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando aplicación..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-darker text-slate-200 font-sans">
          <Navbar user={user} onLogout={handleLogout} />
          
          <main className="flex-grow">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="lg" text="Cargando página..." />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/contest" element={<Contest />} />
                  <Route path="/video/:id" element={<VideoDetail currentUser={user} />} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/profile" element={<Profile user={user} onUserUpdate={setUser} />} />
                  <Route path="/forum" element={<Forum user={user} />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/upload-video" element={<UploadVideo />} />
                  <Route path="/my-videos" element={<MyVideos />} />
                  <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedAdminRoute>
                        <Admin />
                      </ProtectedAdminRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;