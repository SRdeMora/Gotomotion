import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Users, Award, Clock, ArrowRight } from 'lucide-react';
import { MOCK_VIDEOS, MOCK_JURY } from '../constants';
import { Category } from '../types';
import PageTitle from '../components/PageTitle';

const Home: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 4, minutes: 32, seconds: 10 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = Object.values(Category);

  return (
    <>
      <PageTitle title="Inicio" />
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            {/* Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-darker via-darker/80 to-darker z-10"></div>
            <img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="" aria-hidden="true" />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight drop-shadow-2xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
              DEMUESTRA TU TALENTO
            </span>
            <span className="text-xl sm:text-3xl md:text-5xl font-light">LIGA GO2MOTION AWARDS</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            La plataforma definitiva para creadores de videoclips. Compite, vota y conecta con la industria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-4 bg-secondary hover:bg-pink-600 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all transform hover:scale-105"
            >
              REGÍSTRATE Y VOTA
            </Link>
            <Link
              to="/contest"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold text-lg transition-all"
            >
              VER CONCURSO
            </Link>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="bg-gradient-to-r from-indigo-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
            <Clock className="text-accent" /> CIERRE DE LA RONDA ACTUAL
          </h2>
          <div className="flex justify-center gap-6 sm:gap-12 text-white">
            {[
              { label: 'DÍAS', value: timeLeft.days },
              { label: 'HORAS', value: timeLeft.hours },
              { label: 'MINS', value: timeLeft.minutes },
              { label: 'SEGS', value: timeLeft.seconds }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-4xl sm:text-6xl font-black tabular-nums">{item.value.toString().padStart(2, '0')}</span>
                <span className="text-xs sm:text-sm font-medium opacity-70 tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What can you do */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-16">¿Qué puedes hacer en Go2Motion?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <TrendingUp size={40} />, title: 'Sube tu Videoclip', text: 'Participa en las rondas anuales y acumula puntos para el ranking.' },
              { icon: <Award size={40} />, title: 'Vota y Decide', text: 'Apoya a tus compañeros. Tu voto cuenta para elegir a los finalistas.' },
              { icon: <Users size={40} />, title: 'Comunidad', text: 'Conecta con otros creativos, resuelve dudas y aprende en el foro.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-card p-8 rounded-2xl border border-white/5 hover:border-secondary/50 transition-all group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-darker relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Categorías en Juego</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-card/50 p-6 rounded-xl border border-white/5 text-center hover:bg-white/5 transition-colors cursor-default">
                 <Award className="mx-auto mb-4 text-accent" size={32} />
                 <h4 className="text-lg font-medium text-slate-200">{cat}</h4>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
             <Link to="/how-it-works" className="text-sm text-gray-400 underline hover:text-white">
               Revisa las bases legales y reglas de la Liga
             </Link>
          </div>
        </div>
      </section>

      {/* Top 3 Preview (Ranking) */}
      <section className="py-20 bg-dark">
         <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
               <h2 className="text-3xl font-bold text-white">Ranking en Vivo</h2>
               <Link to="/ranking" className="text-secondary font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Ver ranking completo <ArrowRight size={16} />
               </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {MOCK_VIDEOS.slice(0, 3).map((video, idx) => (
                 <div key={video.id} className="relative group">
                    <div className={`absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl z-20 shadow-lg ${
                       idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : 'bg-orange-700 text-white'
                    }`}>
                       {idx + 1}
                    </div>
                    <div className="rounded-xl overflow-hidden aspect-video border border-white/10 group-hover:border-secondary/50 transition-colors">
                       <img src={video.thumbnail} alt={`Miniatura del videoclip ${video.title}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="mt-4">
                       <h3 className="text-lg font-bold text-white truncate">{video.title}</h3>
                       <p className="text-sm text-gray-400">{video.authorName}</p>
                       <p className="text-xs text-secondary mt-1">{video.votes} Puntos</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Jury */}
      <section id="jury" className="py-20 bg-darker">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Jurado de la Edición</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {MOCK_JURY.map((jury) => (
              <div key={jury.id} className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-accent mb-4">
                  <img src={jury.image} alt={`${jury.name}, ${jury.role}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="text-xl font-bold text-white">{jury.name}</h3>
                <p className="text-secondary text-sm font-medium mb-2">{jury.role}</p>
                <p className="text-gray-400 text-sm">{jury.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;