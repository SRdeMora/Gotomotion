import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Eye, Heart, Calendar, Edit, Trash2 } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { api } from '../src/services/api';
import { authService } from '../src/services/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  description?: string;
  categories: string[];
  votes: number;
  views: number;
  round: number;
  year: number;
  createdAt: string;
}

const MyVideos: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyVideos();
  }, []);

  const loadMyVideos = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      if (!token) {
        setError('Debes iniciar sesión');
        navigate('/auth');
        return;
      }

      // Obtener usuario actual
      const currentUser = await api.getCurrentUser(token);
      
      // Obtener todos los videos con información del autor
      const response = await api.getVideos();
      
      // Filtrar videos del usuario actual
      // El backend devuelve videos con author incluido
      const myVideos = response.videos
        .filter((video: any) => {
          // Verificar si el video tiene author y coincide con el usuario actual
          return video.author?.id === currentUser.user.id || video.authorId === currentUser.user.id;
        })
        .map((video: any) => ({
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail,
          videoUrl: video.videoUrl,
          description: video.description,
          categories: typeof video.categories === 'string' 
            ? JSON.parse(video.categories || '[]')
            : video.categories,
          votes: video.votes || 0,
          views: video.views || 0,
          round: video.round,
          year: video.year,
          createdAt: video.createdAt,
        }));

      setVideos(myVideos);
    } catch (err: any) {
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        showWarning('Debes iniciar sesión');
        return;
      }

      await api.request(`/videos/${videoId}`, {
        method: 'DELETE',
        token,
      });

      showSuccess('Video eliminado correctamente');
      loadMyVideos();
    } catch (err: any) {
      showError(getFriendlyErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="Mis Videos" />
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <LoadingSpinner size="lg" text="Cargando tus videos..." />
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Mis Videos" />
      <div className="min-h-screen bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Mis Videos</h1>
            <Link
              to="/upload-video"
              className="px-6 py-3 bg-secondary hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <PlayCircle size={20} />
              Subir Nuevo Video
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {videos.length === 0 ? (
            <div className="text-center py-20">
              <PlayCircle size={64} className="mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No tienes videos aún</h2>
              <p className="text-gray-400 mb-6">Comienza a participar subiendo tu primer videoclip</p>
              <Link
                to="/upload-video"
                className="inline-block px-6 py-3 bg-secondary hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Subir mi Primer Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-card rounded-xl overflow-hidden border border-white/5 hover:border-secondary/50 transition-all group"
                >
                  <Link to={`/video/${video.id}`} className="block relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle size={64} className="text-white" />
                    </div>
                  </Link>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{video.title}</h3>
                    
                    {video.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {video.categories.slice(0, 2).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/10"
                        >
                          {cat}
                        </span>
                      ))}
                      {video.categories.length > 2 && (
                        <span className="text-xs text-gray-500">+{video.categories.length - 2}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye size={16} />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={16} />
                          {video.votes}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        Ronda {video.round} - {video.year}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <Link
                        to={`/video/${video.id}`}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm text-center transition-colors"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyVideos;

