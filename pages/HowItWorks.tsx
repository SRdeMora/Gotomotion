import React from 'react';
import { Check, User, Users, Euro } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

const HowItWorks: React.FC = () => {
  return (
    <>
      <PageTitle title="Cómo Participar" />
      <div className="min-h-screen bg-dark py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">Cómo Participar</h1>
        <p className="text-xl text-gray-400 text-center mb-16">
           Todo lo que necesitas saber para unirte a la Liga Go2Motion Awards, ya sea como creador o como votante.
        </p>

        {/* Roles */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
           <div className="bg-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <User size={100} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Votante</h3>
              <ul className="space-y-3 text-gray-300 mb-8">
                 <li className="flex items-start gap-2"><Check className="text-green-500 mt-1 shrink-0" size={16}/> Registro gratuito.</li>
                 <li className="flex items-start gap-2"><Check className="text-green-500 mt-1 shrink-0" size={16}/> Vota por tus videoclips favoritos.</li>
                 <li className="flex items-start gap-2"><Check className="text-green-500 mt-1 shrink-0" size={16}/> Acceso a ver perfiles y rankings.</li>
              </ul>
              <Link to="/auth" className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                 Registro Votante
              </Link>
           </div>

           <div className="bg-gradient-to-br from-indigo-900 to-card p-8 rounded-2xl border border-secondary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Users size={100} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Participante Activo</h3>
              <p className="text-indigo-200 text-sm mb-4">Individual o Equipo</p>
              <ul className="space-y-3 text-gray-300 mb-8">
                 <li className="flex items-start gap-2"><Check className="text-secondary mt-1 shrink-0" size={16}/> Sube tus videoclips a concurso.</li>
                 <li className="flex items-start gap-2"><Check className="text-secondary mt-1 shrink-0" size={16}/> Acumula puntos para el Ranking Anual.</li>
                 <li className="flex items-start gap-2"><Check className="text-secondary mt-1 shrink-0" size={16}/> Acceso exclusivo al Foro.</li>
                 <li className="flex items-start gap-2"><Check className="text-secondary mt-1 shrink-0" size={16}/> También puedes votar.</li>
              </ul>
              <Link to="/auth" className="inline-block bg-secondary hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-pink-500/20">
                 Registro Participante
              </Link>
           </div>
        </div>

        {/* Pricing */}
        <div className="mb-20">
           <h2 className="text-3xl font-bold text-white text-center mb-10">Tasas de Inscripción</h2>
           <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-white/5 text-center hover:border-white/20 transition-colors">
                 <h3 className="text-gray-400 font-medium mb-2">Mejor Videoclip (Equipo)</h3>
                 <p className="text-4xl font-bold text-white mb-4">6,95€</p>
                 <p className="text-xs text-gray-500">Por videoclip subido</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-white/5 text-center hover:border-white/20 transition-colors">
                 <h3 className="text-gray-400 font-medium mb-2">Categorías Técnicas</h3>
                 <p className="text-4xl font-bold text-white mb-4">4,95€</p>
                 <p className="text-xs text-gray-500">Individual (Dir, Foto, Arte...)</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-white/5 text-center hover:border-white/20 transition-colors">
                 <h3 className="text-gray-400 font-medium mb-2">Categoría Adicional</h3>
                 <p className="text-4xl font-bold text-white mb-4">2,95€</p>
                 <p className="text-xs text-gray-500">Sumar al mismo video</p>
              </div>
           </div>
        </div>

        {/* Process */}
        <div className="space-y-12">
           <h2 className="text-3xl font-bold text-white text-center mb-10">Proceso de Competición</h2>
           {[
              { title: '1. Registro y Subida', text: 'Crea tu perfil y sube tu obra. Selecciona las categorías en las que quieres competir y realiza el pago correspondiente.' },
              { title: '2. Votación de la Comunidad', text: 'Durante un mes, la comunidad votará. Los 10 mejores de cada categoría pasarán a la fase de jurado.' },
              { title: '3. Jurado Profesional', text: 'El jurado revisará los finalistas durante 15 días y otorgará puntos adicionales (3 puntos al Top 2, 2 puntos al Top 5).' },
              { title: '4. Ranking Anual', text: 'Los puntos se suman a tu perfil. Al final de las 5 rondas anuales, se coronarán los campeones de la Liga.' }
           ].map((step, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                 <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl text-white shrink-0">
                    {idx + 1}
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.text}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default HowItWorks;