import React from 'react';
import { User, UserRole } from '../types';
import { MOCK_TOPICS } from '../constants';
import { MessageSquare, PlusCircle, Lock, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

interface ForumProps {
  user: User | null;
}

const Forum: React.FC<ForumProps> = ({ user }) => {
  const isParticipant = user && (user.role === UserRole.PARTICIPANT_INDIVIDUAL || user.role === UserRole.PARTICIPANT_TEAM);

  if (!isParticipant) {
    return (
      <>
        <PageTitle title="Foro - Acceso Restringido" />
        <div className="min-h-screen bg-dark py-20 px-4 flex flex-col items-center justify-center text-center">
         <div className="bg-card/50 p-10 rounded-2xl border border-white/10 max-w-lg">
            <Lock size={64} className="mx-auto text-secondary mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Acceso Restringido</h1>
            <p className="text-gray-400 mb-8">El foro es exclusivo para Participantes Activos. Los usuarios Votantes no pueden acceder a esta sección.</p>
            {user ? (
               <Link to="/profile" className="bg-primary hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-bold transition-colors">
                  Actualizar a Participante
               </Link>
            ) : (
               <Link to="/auth" className="bg-primary hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-bold transition-colors">
                  Iniciar Sesión
               </Link>
            )}
         </div>
      </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Foro de la Comunidad" />
      <div className="min-h-screen bg-dark py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Comunidad Go2Motion</h1>
               <p className="text-sm sm:text-base text-gray-400">Comparte, aprende y conecta con otros creadores.</p>
            </div>
            <button className="w-full sm:w-auto bg-secondary hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
               <PlusCircle size={20} /> Nuevo Tema
            </button>
         </div>

         <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Categories */}
            <div className="space-y-4">
               <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Categorías</h3>
               {['General', 'Técnica', 'Promoción', 'Normativa', 'Showcase'].map((cat) => (
                  <button key={cat} className="block w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                     {cat}
                  </button>
               ))}
            </div>

            {/* Topics List */}
            <div className="lg:col-span-3 space-y-4">
               {MOCK_TOPICS.map((topic) => (
                  <div key={topic.id} className="bg-card p-6 rounded-xl border border-white/5 hover:border-secondary/30 transition-all cursor-pointer group">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded uppercase">{topic.category}</span>
                        <span className="text-xs text-gray-500">Última actividad: {topic.lastActivity}</span>
                     </div>
                     <h3 className="text-lg font-bold text-white mb-2 group-hover:text-secondary transition-colors">{topic.title}</h3>
                     <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><UserIcon size={14} /> {topic.authorName}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={14} /> {topic.replies} respuestas</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
    </>
  );
};

export default Forum;