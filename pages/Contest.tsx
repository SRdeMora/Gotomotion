import React, { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Category, Video } from '../types';
import PageTitle from '../components/PageTitle';
import { api } from '../src/services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';
import { MOCK_YOUTUBE_VIDEOS } from '../constants/mockVideos';

const Contest: React.FC = () => {
  const { showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params: any = {};
        
        // Si hay una categoría seleccionada (y no es "Todas"), filtrar por categoría
        if (selectedCategory !== 'Todas') {
          // Convertir nombre de categoría a valor del enum
          const categoryMap: Record<string, string> = {
            'Mejor Videoclip': 'BEST_VIDEO',
            'Mejor Dirección': 'BEST_DIRECTION',
            'Mejor Fotografía': 'BEST_PHOTOGRAPHY',
            'Mejor Arte': 'BEST_ART',
            'Mejor Montaje': 'BEST_EDITING',
            'Mejor Color': 'BEST_COLOR',
          };
          const categoryValue = categoryMap[selectedCategory] || selectedCategory;
          params.category = categoryValue;
        }

        // Si hay término de búsqueda, agregarlo
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const response = await api.getVideos(params);
        
        // Parsear videos y formatear categorías
        const formattedVideos: Video[] = response.videos.map((v: any) => {
          // Parsear categories si viene como string (SQLite)
          const categories = typeof v.categories === 'string'
            ? JSON.parse(v.categories || '[]')
            : v.categories || [];

          // Mapear valores de enum a nombres amigables para mostrar
          const categoryDisplayMap: Record<string, string> = {
            'BEST_VIDEO': 'Mejor Videoclip',
            'BEST_DIRECTION': 'Mejor Dirección',
            'BEST_PHOTOGRAPHY': 'Mejor Fotografía',
            'BEST_ART': 'Mejor Arte',
            'BEST_EDITING': 'Mejor Montaje',
            'BEST_COLOR': 'Mejor Color',
          };

          const displayCategories = categories.map((cat: string) => 
            categoryDisplayMap[cat] || cat
          );

          return {
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            videoUrl: v.videoUrl || v.videoLink || '',
            authorId: v.authorId || v.author?.id || '',
            authorName: v.author?.name || v.authorName || 'Usuario',
            categories: displayCategories,
            votes: v.votes || v._count?.votes || 0,
            views: v.views || 0,
            materialsUsed: v.materialsUsed || '',
            description: v.description || '',
            round: v.round || 1,
            year: v.year || new Date().getFullYear(),
          };
        });

        // Combinar videos reales con videos mock de YouTube
        // Los videos reales aparecen primero, luego los mock
        const allVideos = [...formattedVideos, ...MOCK_YOUTUBE_VIDEOS];

        setVideos(allVideos);
      } catch (err: any) {
        console.error('[CONTEST] Error al cargar videos:', err);
        const friendlyError = getFriendlyErrorMessage(err);
        setError(friendlyError);
        showError(friendlyError);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para la búsqueda
    const timeoutId = setTimeout(() => {
      fetchVideos();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchTerm]);

  const filteredVideos = videos.filter(video => {
    // Si hay término de búsqueda, filtrar por título o autor
    if (searchTerm) {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            video.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    // Si hay categoría seleccionada (y no es "Todas"), filtrar por categoría
    // Esto aplica tanto a videos reales como mock
    if (selectedCategory !== 'Todas') {
      const hasCategory = video.categories.some(cat => cat === selectedCategory);
      return hasCategory;
    }
    
    return true;
  });

  // Mapeo de categorías para el selector
  const categoryOptions = [
    'Todas',
    'Mejor Videoclip',
    'Mejor Dirección',
    'Mejor Fotografía',
    'Mejor Arte',
    'Mejor Montaje',
    'Mejor Color',
  ];

  if (isLoading && videos.length === 0) {
    return (
      <>
        <PageTitle title="Galería de Concurso" />
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <LoadingSpinner text="Cargando galería..." />
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Galería de Concurso" />
      <div className="min-h-screen bg-dark py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Galería de Concurso</h1>
            <p className="text-sm sm:text-base text-gray-400 px-2">Explora las obras maestras de esta ronda y vota por tus favoritas.</p>
          </div>

          {/* Filters */}
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-white/5 mb-6 sm:mb-10 flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch md:items-center justify-between shadow-xl">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar videoclip o autor..." 
                className="w-full pl-10 pr-4 py-3 bg-darker rounded-lg border border-gray-700 text-white focus:outline-none focus:border-secondary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Filter size={20} className="text-secondary shrink-0" />
              <select 
                className="bg-darker text-white py-3 px-4 rounded-lg border border-gray-700 focus:outline-none focus:border-secondary cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat === 'Todas' ? 'Todas las categorías' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Video Grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredVideos.map((video) => (
                <div key={video.id} className="bg-card rounded-xl overflow-hidden border border-white/5 hover:border-secondary/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
                  <Link to={`/video/${video.id}`} className="block relative aspect-video overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={`Miniatura del videoclip ${video.title} de ${video.authorName}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      loading="lazy" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <PlayCircle size={64} className="text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.votes} Votos
                    </div>
                  </Link>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white line-clamp-1">{video.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">por <span className="text-secondary">{video.authorName}</span></p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {video.categories.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/10">
                          {cat}
                        </span>
                      ))}
                      {video.categories.length > 2 && (
                        <span className="text-xs text-gray-500 py-1">+{video.categories.length - 2}</span>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-gray-500">
                      {video.materialsUsed && (
                        <span>Material: {video.materialsUsed.substring(0, 20)}...</span>
                      )}
                      <Link to={`/video/${video.id}`} className="text-primary hover:text-white font-medium">Ver Ficha &rarr;</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl mb-4">
                {isLoading ? 'Cargando videos...' : 'No se encontraron videoclips con estos filtros.'}
              </p>
              {!isLoading && (
                <p className="text-gray-600">Intenta cambiar los filtros de búsqueda o categoría.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Contest;
