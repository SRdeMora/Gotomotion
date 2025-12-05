import React, { useState } from 'react';
import { MOCK_VIDEOS } from '../constants';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PageTitle from '../components/PageTitle';

const Ranking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'ronda'>('general');

  // Mock data for chart
  const data = MOCK_VIDEOS.map(v => ({
    name: v.title.substring(0, 10) + '...',
    votes: v.votes
  })).sort((a, b) => b.votes - a.votes);

  return (
    <>
      <PageTitle title="Clasificación" />
      <div className="min-h-screen bg-dark py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">Clasificación de la Liga</h1>
           <p className="text-sm sm:text-base text-gray-400">Sigue la evolución de la competencia en tiempo real.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
           <div className="bg-card p-1 rounded-lg inline-flex border border-white/10">
              <button 
                onClick={() => setActiveTab('general')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === 'general' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Ranking Anual
              </button>
              <button 
                onClick={() => setActiveTab('ronda')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === 'ronda' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Ronda Actual
              </button>
           </div>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-16 px-4">
           {[MOCK_VIDEOS[1], MOCK_VIDEOS[0], MOCK_VIDEOS[2]].map((video, idx) => {
              const height = idx === 1 ? 'h-64' : idx === 0 ? 'h-48' : 'h-40'; // Middle is #1
              const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const color = rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-orange-700';
              
              return (
                 <div key={video.id} className="flex flex-col items-center w-full max-w-[200px]">
                    <div className="mb-4 text-center">
                       <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden mx-auto mb-2">
                          <img src={video.thumbnail} alt={`Miniatura de ${video.title}`} className="w-full h-full object-cover" loading="lazy" />
                       </div>
                       <p className="text-white font-bold text-sm truncate w-32">{video.title}</p>
                       <p className="text-secondary text-xs">{video.votes} pts</p>
                    </div>
                    <div className={`${height} w-full ${color} rounded-t-lg flex items-start justify-center pt-4 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                       <span className="text-4xl font-black text-black/50">{rank}</span>
                    </div>
                 </div>
              );
           })}
        </div>

        {/* Chart Section */}
        <div className="bg-card p-6 rounded-xl border border-white/5 mb-10">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <TrendingUp className="text-accent" /> Tendencia de Votos (Top Videos)
           </h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                   <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                   <YAxis stroke="#9ca3af" fontSize={12} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                      itemStyle={{ color: '#ec4899' }}
                   />
                   <Bar dataKey="votes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Full Table */}
        <div className="bg-card rounded-xl border border-white/5 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-300 uppercase text-xs font-bold">
                   <tr>
                      <th className="px-6 py-4">Posición</th>
                      <th className="px-6 py-4">Videoclip</th>
                      <th className="px-6 py-4">Autor</th>
                      <th className="px-6 py-4 hidden md:table-cell">Categoría Principal</th>
                      <th className="px-6 py-4 text-right">Puntos Totales</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                   {MOCK_VIDEOS.map((video, idx) => (
                      <tr key={video.id} className="hover:bg-white/5 transition-colors">
                         <td className="px-6 py-4 text-white font-mono">#{idx + 1}</td>
                         <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                            <img src={video.thumbnail} className="w-10 h-6 object-cover rounded" alt={`Miniatura de ${video.title}`} loading="lazy" />
                            {video.title}
                         </td>
                         <td className="px-6 py-4 text-gray-300">{video.authorName}</td>
                         <td className="px-6 py-4 text-gray-300 hidden md:table-cell">
                            <span className="bg-primary/20 text-indigo-300 px-2 py-1 rounded text-xs border border-primary/20">
                               {video.categories[0]}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-white font-bold text-right">{video.votes}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Ranking;