import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Link as LinkIcon, FileVideo, Image as ImageIcon, AlertCircle } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { api } from '../src/services/api';
import { authService } from '../src/services/auth';
import { Category } from '../types';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';

const UploadVideo: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showWarning } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'categories' | 'upload'>('categories');
  
  // Form data
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Mapeo de nombres amigables a valores del enum
  const categoryMap: Record<string, string> = {
    'Mejor Videoclip': 'BEST_VIDEO',
    'Mejor Dirección': 'BEST_DIRECTION',
    'Mejor Fotografía': 'BEST_PHOTOGRAPHY',
    'Mejor Arte': 'BEST_ART',
    'Mejor Montaje': 'BEST_EDITING',
    'Mejor Color': 'BEST_COLOR',
  };

  // Mapeo inverso para mostrar nombres amigables
  const categoryDisplayMap: Record<string, string> = {
    'BEST_VIDEO': 'Mejor Videoclip',
    'BEST_DIRECTION': 'Mejor Dirección',
    'BEST_PHOTOGRAPHY': 'Mejor Fotografía',
    'BEST_ART': 'Mejor Arte',
    'BEST_EDITING': 'Mejor Montaje',
    'BEST_COLOR': 'Mejor Color',
  };

  const categories = Object.values(Category); // Nombres amigables para mostrar

  const handleCategoryToggle = (categoryDisplayName: string) => {
    const categoryValue = categoryMap[categoryDisplayName];
    if (selectedCategories.includes(categoryValue)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryValue));
    } else {
      setSelectedCategories([...selectedCategories, categoryValue]);
    }
  };

  const handleCreatePayment = async () => {
    if (selectedCategories.length === 0) {
      setError('Debes seleccionar al menos una categoría');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      if (!token) {
        setError('Debes iniciar sesión');
        navigate('/auth');
        return;
      }

      // Eliminar duplicados y validar categorías
      const uniqueCategories = [...new Set(selectedCategories)];
      console.log('[UPLOAD] Categorías seleccionadas:', uniqueCategories);

      const response = await api.request<{ paymentId: string; url?: string; mock?: boolean }>(
        '/payments/create-checkout-session',
        {
          method: 'POST',
          token,
          body: JSON.stringify({ categories: uniqueCategories }),
        }
      );

      setPaymentId(response.paymentId);

      // Si es modo prueba, completar pago automáticamente
      if (response.mock) {
        await api.request(`/payments/${response.paymentId}/complete`, {
          method: 'POST',
          token,
        });
        setStep('upload');
      } else if (response.url) {
        // Redirigir a Stripe Checkout
        window.location.href = response.url;
      } else {
        setStep('upload');
      }
    } catch (err: any) {
      console.error('[UPLOAD] Error al crear pago:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al crear el pago';
      const errorDetails = err.response?.data?.details || err.response?.data?.message;
      const receivedCategories = err.response?.data?.received;
      const validCategories = err.response?.data?.valid;
      
      let fullErrorMessage = errorMessage;
      if (errorDetails) {
        fullErrorMessage += `: ${errorDetails}`;
      }
      if (receivedCategories && validCategories) {
        fullErrorMessage += `\n\nCategorías recibidas: ${JSON.stringify(receivedCategories)}\nCategorías válidas: ${JSON.stringify(validCategories)}`;
      }
      
      setError(fullErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!thumbnailFile) {
      setError('La imagen de portada (thumbnail) es obligatoria');
      return;
    }

    if (!videoLink && !videoFile) {
      setError('Debes proporcionar un video (archivo o link)');
      return;
    }

    // paymentId es opcional ahora (modo demo)
    // Si no hay paymentId, se puede subir el video sin pago

    setIsLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      if (!token) {
        setError('Debes iniciar sesión');
        navigate('/auth');
        return;
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      if (description) formData.append('description', description.trim());
      if (materialsUsed) formData.append('materialsUsed', materialsUsed.trim());
      formData.append('categories', JSON.stringify(selectedCategories));
      // paymentId es opcional - solo agregarlo si existe
      if (paymentId) {
        formData.append('paymentId', paymentId);
      }
      if (videoLink) formData.append('videoLink', videoLink.trim());
      if (videoFile) formData.append('video', videoFile);
      formData.append('thumbnail', thumbnailFile);

      console.log('[UPLOAD] Enviando video con datos:', {
        title,
        categories: selectedCategories,
        paymentId,
        hasVideoLink: !!videoLink,
        hasVideoFile: !!videoFile,
        hasThumbnail: !!thumbnailFile,
      });

      const response = await api.createVideo(formData, token);
      
      // El éxito se maneja con navigate, no necesitamos toast aquí
      navigate('/profile');
    } catch (err: any) {
      console.error('[UPLOAD] Error al subir video:', err);
      
      // Convertir errores técnicos en mensajes amigables
      const friendlyError = getFriendlyErrorMessage(err);
      
      // Si hay errores de validación específicos, mejorarlos
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const friendlyValidationErrors = validationErrors.map((e: any) => {
          // Convertir nombres técnicos a mensajes amigables
          const paramMap: Record<string, string> = {
            'title': 'Título',
            'description': 'Descripción',
            'categories': 'Categorías',
            'thumbnail': 'Imagen de portada',
            'video': 'Video',
            'videoLink': 'Enlace del video',
            'materialsUsed': 'Material utilizado',
          };
          const paramName = paramMap[e.param] || e.param;
          return `${paramName}: ${e.msg}`;
        }).join('. ');
        setError(friendlyValidationErrors);
        showError(friendlyValidationErrors);
      } else {
        setError(friendlyError);
        showError(friendlyError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'categories') {
    return (
      <>
        <PageTitle title="Seleccionar Categorías" />
        <div className="min-h-screen bg-dark py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-2xl p-8 border border-white/5">
              <h1 className="text-3xl font-bold text-white mb-2">Selecciona las Categorías</h1>
              <p className="text-gray-400 mb-6">Elige en qué categorías quieres participar con tu videoclip.</p>

              <div className="space-y-4 mb-8">
                {categories.map((categoryDisplayName) => {
                  const categoryValue = categoryMap[categoryDisplayName];
                  const isSelected = selectedCategories.includes(categoryValue);
                  return (
                    <button
                      key={categoryDisplayName}
                      type="button"
                      onClick={() => handleCategoryToggle(categoryDisplayName)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-secondary bg-secondary/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{categoryDisplayName}</span>
                        {isSelected && (
                          <span className="text-secondary">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCategories.length > 0 && (
                <div className="bg-white/5 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-400 mb-2">Categorías seleccionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((catValue) => (
                      <span key={catValue} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
                        {categoryDisplayMap[catValue] || catValue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePayment}
                  disabled={isLoading || selectedCategories.length === 0}
                  className="flex-1 px-6 py-3 bg-secondary hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Procesando...' : 'Continuar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Subir Videoclip" />
      <div className="min-h-screen bg-dark py-6 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Subir Videoclip</h1>
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Título del Videoclip *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white focus:outline-none focus:border-secondary"
                  placeholder="Ej: Neon Dreams"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white focus:outline-none focus:border-secondary resize-none"
                  placeholder="Describe tu videoclip..."
                />
              </div>

              {/* Materiales utilizados */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Materiales y Equipo Utilizado (opcional)
                </label>
                <textarea
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white focus:outline-none focus:border-secondary resize-none"
                  placeholder="Ej: Cámara Canon EOS R5, Lente 50mm f/1.2, Estabilizador DJI..."
                />
              </div>

              {/* Video - Link o Archivo */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Video *
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <LinkIcon size={16} />
                      Opción 1: Link externo (YouTube, Vimeo, etc.)
                    </label>
                    <input
                      type="url"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white focus:outline-none focus:border-secondary"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="text-center text-gray-400">o</div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <FileVideo size={16} />
                      Opción 2: Subir archivo de video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white focus:outline-none focus:border-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Imagen de Portada (Thumbnail) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white focus:outline-none focus:border-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-indigo-600"
                />
                <p className="text-xs text-gray-400 mt-2">Formato recomendado: 16:9 (1920x1080)</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('categories')}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-secondary hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Upload size={20} className="animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Subir Video
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadVideo;

