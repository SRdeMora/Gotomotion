import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Settings, Video, Upload, Mail, LogOut, X, Save, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import ImageCropper from '../components/ImageCropper';
import { api } from '../src/services/api';
import { authService } from '../src/services/auth';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';

interface ProfileProps {
  user: User | null;
  onUserUpdate?: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0); // Clave para forzar remontaje del input
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    sector: user?.sector || '',
    web: user?.socials?.web || '',
    instagram: user?.socials?.instagram || '',
    linkedin: user?.socials?.linkedin || '',
    twitter: user?.socials?.twitter || '',
  });

  if (!user) {
    return (
      <>
        <PageTitle title="Perfil" />
        <div className="min-h-screen flex items-center justify-center text-white">
          <p>Por favor, inicia sesión para ver tu perfil.</p>
        </div>
      </>
    );
  }

  const isVoter = user.role === UserRole.VOTER;
  const isParticipant = user.role === UserRole.PARTICIPANT_INDIVIDUAL || user.role === UserRole.PARTICIPANT_TEAM;

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      sector: user.sector || '',
      web: user.socials?.web || '',
      instagram: user.socials?.instagram || '',
      linkedin: user.socials?.linkedin || '',
      twitter: user.socials?.twitter || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      sector: user.sector || '',
      web: user.socials?.web || '',
      instagram: user.socials?.instagram || '',
      linkedin: user.socials?.linkedin || '',
      twitter: user.socials?.twitter || '',
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showWarning('Solo se permiten archivos de imagen');
        // Resetear input
        e.target.value = '';
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showWarning('La imagen debe ser menor a 5MB');
        // Resetear input
        e.target.value = '';
        return;
      }

      // Leer imagen y mostrar cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result as string;
        setImageToCrop(imageSrc);
        setShowCropper(true);
      };
      reader.onerror = () => {
        showError('Error al leer la imagen. Por favor, intenta con otra imagen.');
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false);
    
    // Crear preview de la imagen recortada
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedImageBlob);

    // Subir la imagen recortada
    setIsUploadingAvatar(true);
    try {
      const token = authService.getToken();
      if (!token) {
        showWarning('Debes iniciar sesión para actualizar tu avatar');
        return;
      }

      // Convertir blob a File
      const croppedFile = new File([croppedImageBlob], 'avatar.jpg', {
        type: 'image/jpeg',
      });

      const response = await api.uploadAvatar(user.id, croppedFile, token);

      const updatedUser: User = {
        ...user,
        avatar: response.user.avatar,
      };

      // Actualizar usuario en el estado global
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      // Actualizar en localStorage
      authService.setUser(updatedUser);

      setAvatarPreview(null);
      setImageToCrop(null);
      // Forzar remontaje del input para que funcione siempre
      setInputKey(prev => prev + 1);
      showSuccess('Foto de perfil actualizada correctamente');
    } catch (error: any) {
      console.error('Error al subir avatar:', error);
      showError(getFriendlyErrorMessage(error));
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  const handleUpgradeRole = async (newRole: UserRole.PARTICIPANT_INDIVIDUAL | UserRole.PARTICIPANT_TEAM) => {
    setIsUpgradingRole(true);
    try {
      const token = authService.getToken();
      if (!token) {
        showWarning('Debes iniciar sesión para cambiar tu rol');
        return;
      }

      const response = await api.updateUserRole(user.id, newRole, token);

      const updatedUser: User = {
        ...user,
        role: response.user.role as UserRole,
      };

      // Actualizar usuario en el estado global
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      // Actualizar en localStorage
      authService.setUser(updatedUser);

      setShowRoleSelection(false);
      showSuccess(`¡Felicidades! Ahora eres ${newRole === UserRole.PARTICIPANT_INDIVIDUAL ? 'Participante Individual' : 'Participante Equipo'}. Ya puedes subir videos y participar en el concurso.`);
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      showError(getFriendlyErrorMessage(error));
    } finally {
      setIsUpgradingRole(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showWarning('El nombre es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        showWarning('Debes iniciar sesión para editar tu perfil');
        return;
      }

      const socials: any = {};
      if (formData.web) socials.web = formData.web;
      if (formData.instagram) socials.instagram = formData.instagram;
      if (formData.linkedin) socials.linkedin = formData.linkedin;
      if (formData.twitter) socials.twitter = formData.twitter;

      const response = await api.updateUser(
        user.id,
        {
          name: formData.name.trim(),
          bio: formData.bio.trim() || undefined,
          sector: formData.sector.trim() || undefined,
          socials: Object.keys(socials).length > 0 ? socials : undefined,
        },
        token
      );

      const updatedUser: User = {
        ...user,
        name: response.user.name,
        bio: response.user.bio,
        sector: response.user.sector,
        socials: response.user.socials || {},
        avatar: response.user.avatar || user.avatar, // Mantener avatar actualizado
      };

      // Actualizar usuario en el estado global
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      // Actualizar en localStorage
      authService.setUser(updatedUser);

      setIsEditing(false);
      setAvatarPreview(null);
      showSuccess('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      showError(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Mi Perfil" />
      <div className="min-h-screen bg-dark py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Basic Info */}
        <div className="bg-card rounded-2xl p-4 sm:p-8 border border-white/5 mb-6 sm:mb-8 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8">
           <div className="relative">
              <div className="relative group">
                <img 
                  src={avatarPreview || user.avatar} 
                  alt={`Avatar de ${user.name}`} 
                  className="w-32 h-32 rounded-full border-4 border-secondary object-cover" 
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <label htmlFor="avatar-input" className="cursor-pointer flex flex-col items-center gap-1">
                        <Settings size={20} className="text-white" />
                        <span className="text-white text-xs">Cambiar foto</span>
                        <input
                          id="avatar-input"
                          key={`avatar-input-${inputKey}`}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
              <span className="absolute bottom-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-full border border-dark">
                {isVoter ? 'Votante' : 'Participante'}
              </span>
           </div>
           
           <div className="flex-1 text-center md:text-left">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                  <p className="text-gray-400 max-w-lg mb-4">{user.bio || "Amante del mundo audiovisual y creativo en constante evolución."}</p>
                  {user.sector && (
                    <p className="text-gray-500 text-sm mb-2">Sector: {user.sector}</p>
                  )}
                </>
              ) : (
                <div className="space-y-3 max-w-lg">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre"
                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-secondary"
                    required
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Biografía"
                    rows={3}
                    maxLength={500}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-secondary resize-none"
                  />
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="Sector profesional"
                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-secondary"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <input
                      type="url"
                      value={formData.web}
                      onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                      placeholder="Web"
                      className="bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="Instagram"
                      className="bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn"
                      className="bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="Twitter"
                      className="bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 {user.socials?.web && (
                    <a href={user.socials.web} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"><Mail size={14}/> Contacto</a>
                 )}
                 {!isEditing ? (
                   <button 
                     onClick={handleEdit}
                     className="text-secondary border border-secondary/50 px-4 py-1 rounded-full text-sm hover:bg-secondary/10 flex items-center gap-2 transition-colors"
                   >
                     <Settings size={14} /> Editar Perfil
                   </button>
                 ) : (
                   <div className="flex gap-2">
                     <button 
                       onClick={handleSave}
                       disabled={isLoading}
                       className="text-green-400 border border-green-400/50 px-4 py-1 rounded-full text-sm hover:bg-green-400/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                     >
                       <Save size={14} /> {isLoading ? 'Guardando...' : 'Guardar'}
                     </button>
                     <button 
                       onClick={handleCancel}
                       disabled={isLoading}
                       className="text-gray-400 border border-gray-400/50 px-4 py-1 rounded-full text-sm hover:bg-gray-400/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                     >
                       <X size={14} /> Cancelar
                     </button>
                   </div>
                 )}
              </div>
           </div>

           {/* Stats for Participant */}
           {isParticipant && (
             <div className="flex gap-6 text-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                   <span className="block text-2xl font-bold text-white">4</span>
                   <span className="text-xs text-gray-400">Videos</span>
                </div>
                <div>
                   <span className="block text-2xl font-bold text-secondary">2.4k</span>
                   <span className="text-xs text-gray-400">Votos</span>
                </div>
                <div>
                   <span className="block text-2xl font-bold text-accent">#12</span>
                   <span className="text-xs text-gray-400">Ranking</span>
                </div>
             </div>
           )}
        </div>

        {/* Upgrade CTA for Voters */}
        {isVoter && (
           <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 mb-8 text-center border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-2">¡Pasa al siguiente nivel!</h2>
              <p className="text-indigo-200 mb-6">Actualiza tu perfil a Participante para subir tus propios videoclips y competir en la Liga.</p>
              
              {!showRoleSelection ? (
                <button 
                  onClick={() => setShowRoleSelection(true)}
                  className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                >
                  <UserPlus size={20} />
                  Convertirse en Participante
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-white font-medium">Selecciona el tipo de participación:</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleUpgradeRole(UserRole.PARTICIPANT_INDIVIDUAL)}
                      disabled={isUpgradingRole}
                      className="px-6 py-3 bg-white/90 hover:bg-white text-indigo-900 font-bold rounded-full transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgradingRole ? 'Procesando...' : 'Participante Individual'}
                    </button>
                    <button
                      onClick={() => handleUpgradeRole(UserRole.PARTICIPANT_TEAM)}
                      disabled={isUpgradingRole}
                      className="px-6 py-3 bg-white/90 hover:bg-white text-indigo-900 font-bold rounded-full transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgradingRole ? 'Procesando...' : 'Participante Equipo'}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowRoleSelection(false)}
                    className="text-indigo-200 hover:text-white text-sm underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
           </div>
        )}

        {/* Participant Dashboard */}
        {isParticipant && (
           <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column: Actions */}
              <div className="space-y-6">
                 <div className="bg-card p-6 rounded-xl border border-white/5">
                    <h3 className="font-bold text-white mb-4">Gestión</h3>
                    <div className="space-y-3">
                       <Link to="/upload-video" className="w-full flex items-center justify-between p-3 bg-primary hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                          <span className="flex items-center gap-2"><Upload size={18} /> Subir Nuevo Videoclip</span>
                       </Link>
                       <Link to="/my-videos" className="w-full flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Video size={18} /> Mis Videos
                       </Link>
                       <Link to="/how-it-works" className="w-full flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Settings size={18} /> Pagos y Recibos
                       </Link>
                    </div>
                 </div>
              </div>

              {/* Right Column: Active Videos */}
              <div className="md:col-span-2 space-y-6">
                 <h2 className="text-xl font-bold text-white">Mis Participaciones Activas</h2>
                 {/* Mock User Video */}
                 <div className="bg-card p-4 rounded-xl border border-white/5 flex gap-4">
                    <div className="w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden shrink-0">
                       <img src="https://picsum.photos/300/170" alt="Videoclip participante" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white text-lg">Neon Dreams</h3>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/20">En Concurso</span>
                       </div>
                       <p className="text-sm text-gray-400 mb-2">Ronda 1 • 2024</p>
                       <div className="flex items-center gap-4 text-sm">
                          <span className="text-secondary font-bold">1,240 Votos</span>
                          <span className="text-gray-500">Ranking: #12</span>
                       </div>
                       <div className="mt-3 flex gap-2">
                          <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded">Ver estadísticas</button>
                          <button className="text-xs border border-white/10 hover:bg-white/5 text-gray-300 px-3 py-1 rounded">Editar</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
    
    {/* Image Cropper Modal */}
    {showCropper && imageToCrop && (
      <ImageCropper
        imageSrc={imageToCrop}
        onClose={() => {
          setShowCropper(false);
          setImageToCrop(null);
          // Forzar remontaje del input para que funcione siempre
          setInputKey(prev => prev + 1);
        }}
        onCropComplete={handleCropComplete}
        aspect={1} // Circular para avatar
      />
    )}
    </>
  );
};

export default Profile;