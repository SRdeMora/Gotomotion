import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, User, Share2, Flag, ArrowLeft, Play } from 'lucide-react';
import { UserRole, User as UserType, Video } from '../types';
import PageTitle from '../components/PageTitle';
import { api } from '../src/services/api';
import { authService } from '../src/services/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';
import { MOCK_YOUTUBE_VIDEOS } from '../constants/mockVideos';

interface VideoDetailProps {
  currentUser: UserType | null;
}

const VideoDetail: React.FC<VideoDetailProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [votedCategories, setVotedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) {
        setError('ID de video no válido');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // Primero verificar si es un video mock de YouTube
        const mockVideo = MOCK_YOUTUBE_VIDEOS.find(v => v.id === id);
        if (mockVideo) {
          setVideo(mockVideo);
          setIsLoading(false);
          return;
        }

        // Si no es mock, obtener del backend
        const videoData = await api.getVideo(id);
        
        // El backend devuelve el video directamente
        const videoResponse = videoData.video || videoData;
        
        // Parsear categories si viene como string (SQLite)
        const categories = typeof videoResponse.categories === 'string'
          ? JSON.parse(videoResponse.categories || '[]')
          : videoResponse.categories || [];

        const formattedVideo: Video = {
          id: videoResponse.id,
          title: videoResponse.title,
          thumbnail: videoResponse.thumbnail,
          videoUrl: videoResponse.videoUrl || videoResponse.videoLink || '',
          authorId: videoResponse.authorId || videoResponse.author?.id || '',
          authorName: videoResponse.author?.name || videoResponse.authorName || 'Usuario',
          categories,
          votes: videoResponse.votes || videoResponse._count?.votes || 0,
          views: videoResponse.views || 0,
          materialsUsed: videoResponse.materialsUsed || '',
          description: videoResponse.description || '',
          round: videoResponse.round || 1,
          year: videoResponse.year || new Date().getFullYear(),
        };

        setVideo(formattedVideo);
        
        // Si el video tiene categorías, seleccionar la primera por defecto
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
        
        // Verificar qué categorías ya ha votado el usuario
        if (currentUser) {
          try {
            const token = authService.getToken();
            if (token) {
              const checkResponse = await api.request<{ hasVoted: boolean; votedCategories?: string[] }>(
                `/votes/${id}/check`,
                { token }
              );
              if (checkResponse.votedCategories) {
                setVotedCategories(checkResponse.votedCategories);
                // Si todas las categorías están votadas, marcar como votado
                if (checkResponse.votedCategories.length === categories.length) {
                  setHasVoted(true);
                }
              }
            }
          } catch (err) {
            console.error('[VIDEO DETAIL] Error al verificar votos:', err);
          }
        }
      } catch (err: any) {
        console.error('[VIDEO DETAIL] Error al cargar video:', err);
        setError(err.message || 'Error al cargar el video');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id, currentUser]);

  const handleVote = async () => {
    if (!currentUser) {
      showWarning('Debes iniciar sesión para votar');
      navigate('/auth');
      return;
    }

    if (!video || hasVoted) return;

    // Si el video tiene múltiples categorías y no se ha seleccionado una
    if (video.categories.length > 1 && !selectedCategory) {
      showWarning('Por favor, selecciona una categoría para votar');
      return;
    }

    // Si solo hay una categoría, usarla automáticamente
    const categoryToVote = selectedCategory || video.categories[0];
    
    // Verificar si ya votó por esta categoría
    if (votedCategories.includes(categoryToVote)) {
      showWarning('Ya has votado por esta categoría en esta liga');
      return;
    }

    setIsVoting(true);
    try {
      const token = authService.getToken();
      if (!token) {
        showWarning('Debes iniciar sesión para votar');
        navigate('/auth');
        return;
      }

      // Convertir nombre de categoría a valor del enum si es necesario
      const categoryMap: Record<string, string> = {
        'Mejor Videoclip': 'BEST_VIDEO',
        'Mejor Dirección': 'BEST_DIRECTION',
        'Mejor Fotografía': 'BEST_PHOTOGRAPHY',
        'Mejor Arte': 'BEST_ART',
        'Mejor Montaje': 'BEST_EDITING',
        'Mejor Color': 'BEST_COLOR',
      };
      
      const categoryValue = categoryMap[categoryToVote] || categoryToVote;

      await api.vote(video.id, categoryValue, token);
      setVotedCategories([...votedCategories, categoryToVote]);
      
      // Si todas las categorías están votadas, marcar como completamente votado
      if (votedCategories.length + 1 === video.categories.length) {
        setHasVoted(true);
      }
      
      setVideo({ ...video, votes: video.votes + 1 });
      showSuccess('¡Voto registrado correctamente!');
    } catch (err: any) {
      console.error('[VIDEO DETAIL] Error al votar:', err);
      showError(getFriendlyErrorMessage(err));
    } finally {
      setIsVoting(false);
    }
  };

  // Función para determinar si la URL es un embed (YouTube/Vimeo) o un archivo directo
  const isEmbedUrl = (url: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') ||
           url.includes('embed');
  };

  // Convertir URL de YouTube a embed si es necesario
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Si ya es un embed, devolverlo tal cual (pero asegurar parámetros)
    if (url.includes('/embed/')) {
      // Asegurar que tenga los parámetros necesarios
      const hasParams = url.includes('?');
      if (!hasParams) {
        return url;
      }
      return url;
    }
    
    // Convertir YouTube watch URL a embed
    if (url.includes('youtube.com/watch')) {
      // Extraer video ID de manera robusta
      let videoId: string | null = null;
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } catch (e) {
        // Fallback si URL() falla
        const match = url.match(/[?&]v=([^&]+)/);
        videoId = match ? match[1] : null;
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convertir YouTube short URL a embed
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convertir YouTube URL con formato youtube.com/... (sin watch)
    if (url.includes('youtube.com/') && !url.includes('/embed/')) {
      const match = url.match(/youtube\.com\/(?:watch\?v=|)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
      }
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Si no es embed, devolver la URL original (será un archivo directo)
    return url;
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="Cargando video..." />
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <LoadingSpinner text="Cargando video..." />
        </div>
      </>
    );
  }

  if (error || !video) {
    return (
      <>
        <PageTitle title="Video no encontrado" />
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">{error || 'Video no encontrado'}</p>
            <Link 
              to="/contest" 
              className="inline-flex items-center text-primary hover:text-white"
            >
              <ArrowLeft size={16} className="mr-2" /> Volver a la galería
            </Link>
          </div>
        </div>
      </>
    );
  }

  const embedUrl = getEmbedUrl(video.videoUrl || '');
  const isEmbed = isEmbedUrl(video.videoUrl || '');

  return (
    <>
      <PageTitle title={video.title} />
      <div className="min-h-screen bg-dark py-4 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/contest" 
            className="inline-flex items-center text-sm sm:text-base text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Volver a la galería
          </Link>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-6" style={{ paddingBottom: '56.25%' }}>
                {isEmbed && embedUrl ? (
                  <iframe 
                    key={`embed-${video.id}-${embedUrl}`}
                    src={embedUrl} 
                    title={video.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : video.videoUrl ? (
                  <video 
                    src={video.videoUrl} 
                    controls
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                    poster={video.thumbnail}
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p>Video no disponible</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">{video.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-400">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span className="text-white font-medium">{video.authorName}</span>
                    </div>
                    <span>•</span>
                    <span>{video.views} Visualizaciones</span>
                    <span>•</span>
                    <span>{video.votes} Votos</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {video.categories.length > 1 && !hasVoted && (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-darker rounded-lg border border-gray-700 text-white text-sm sm:text-base focus:outline-none focus:border-secondary"
                      disabled={isVoting}
                    >
                      {video.categories
                        .filter(cat => !votedCategories.includes(cat))
                        .map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                  )}
                  <button 
                    onClick={handleVote}
                    disabled={hasVoted || isVoting || (video.categories.length > 1 && !selectedCategory)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                      hasVoted 
                      ? 'bg-green-600 text-white cursor-default' 
                      : 'bg-secondary hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <ThumbsUp size={20} />
                    {hasVoted ? 'Votado' : 'Votar'}
                  </button>
                  <button className="p-3 bg-card border border-white/10 rounded-full text-gray-300 hover:text-white hover:bg-white/5">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Detalles del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-500 text-sm mb-1">Categorías</h4>
                    <div className="flex flex-wrap gap-2">
                      {video.categories.map((cat, idx) => (
                        <span 
                          key={idx} 
                          className="text-sm bg-primary/20 text-indigo-300 px-2 py-1 rounded border border-primary/20"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  {video.materialsUsed && (
                    <div>
                      <h4 className="text-gray-500 text-sm mb-1">Material Utilizado</h4>
                      <p className="text-gray-300 text-sm">{video.materialsUsed}</p>
                    </div>
                  )}
                  {video.description && (
                    <div className="md:col-span-2">
                      <h4 className="text-gray-500 text-sm mb-1">Descripción</h4>
                      <p className="text-gray-300 leading-relaxed">{video.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Card */}
              <div className="bg-card p-6 rounded-xl border border-white/5 text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src={video.authorId ? `https://picsum.photos/200/200?random=${video.authorId}` : '/placeholder-avatar.png'} 
                    alt={`Avatar de ${video.authorName}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{video.authorName}</h3>
                <p className="text-gray-400 text-sm mb-4">Participante Activo</p>
                <Link
                  to={`/profile`}
                  className="block w-full py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Ver Perfil
                </Link>
              </div>

              {/* Ranking State */}
              <div className="bg-gradient-to-b from-indigo-900/50 to-card p-6 rounded-xl border border-indigo-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Flag size={20} className="text-accent" /> Estado en Ranking
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Votos Totales</span>
                    <span className="font-mono font-bold text-white">{video.votes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Visualizaciones</span>
                    <span className="font-mono font-bold text-accent">{video.views}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Ronda</span>
                    <span className="font-mono font-bold text-white">{video.round}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Año</span>
                    <span className="font-mono font-bold text-white">{video.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetail;
