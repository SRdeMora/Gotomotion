import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Video, TrendingUp, DollarSign, Trophy, Calendar, Settings } from 'lucide-react';
import { api } from '../src/services/api';
import { authService } from '../src/services/auth';
import PageTitle from '../components/PageTitle';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../src/contexts/ToastContext';
import { getFriendlyErrorMessage } from '../src/utils/errorMessages';

interface DashboardStats {
  users: {
    total: number;
    voters: number;
    participants: number;
    byRole: {
      voters: number;
      individual: number;
      teams: number;
    };
  };
  videos: {
    total: number;
    byCategory: any[];
    byRound: any[];
  };
  votes: {
    total: number;
    byCategory: any[];
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    revenue: number;
  };
  leagues: {
    total: number;
    active: number;
  };
}

// Componente para pestaña de Ligas
const LeaguesTab: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    round: 1,
    year: new Date().getFullYear(),
    name: '',
    startDate: '',
    endDate: '',
    juryEndDate: '',
  });

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const data = await api.getAdminLeagues(token);
      setLeagues(data.leagues || []);
    } catch (error) {
      console.error('Error loading leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      await api.createLeague(formData, token);
      setShowCreateForm(false);
      loadLeagues();
      showSuccess('Liga creada correctamente');
    } catch (error: any) {
      showError(getFriendlyErrorMessage(error));
    }
  };

  const handleToggleStatus = async (round: number, currentStatus: boolean, year: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      await api.updateLeagueStatus(round, !currentStatus, token, year);
      loadLeagues();
    } catch (error: any) {
      showError(getFriendlyErrorMessage(error));
    }
  };

  const handleDeleteLeague = async (round: number, year: number, leagueName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la Liga ${round} - ${leagueName}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) return;
      await api.deleteLeague(round, token, year);
      loadLeagues();
      showSuccess('Liga eliminada correctamente');
    } catch (error: any) {
      showError(getFriendlyErrorMessage(error));
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Gestión de Ligas</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          {showCreateForm ? 'Cancelar' : 'Nueva Liga'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-darker p-4 rounded-lg mb-4 space-y-3">
          <input
            type="number"
            placeholder="Ronda (1-6)"
            value={formData.round}
            onChange={(e) => setFormData({ ...formData, round: Number(e.target.value) })}
            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white"
            min="1"
            max="6"
          />
          <input
            type="number"
            placeholder="Año"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Nombre de la liga"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="datetime-local"
            placeholder="Fecha inicio"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="datetime-local"
            placeholder="Fecha fin votación pública"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="datetime-local"
            placeholder="Fecha fin votación jurado"
            value={formData.juryEndDate}
            onChange={(e) => setFormData({ ...formData, juryEndDate: e.target.value })}
            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
          <button
            onClick={handleCreateLeague}
            className="w-full bg-secondary hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
          >
            Crear Liga
          </button>
        </div>
      )}

      <div className="space-y-3">
        {leagues.map((league) => (
          <div key={league.id} className="bg-darker p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">
                  Liga {league.round} - {league.name || `${league.year}`}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Inicio: {new Date(league.startDate).toLocaleDateString('es-ES')} | 
                  Fin Público: {new Date(league.endDate).toLocaleDateString('es-ES')} | 
                  Fin Jurado: {new Date(league.juryEndDate).toLocaleDateString('es-ES')}
                </p>
                {league.stats && (
                  <div className="mt-2 text-xs text-gray-500">
                    Videos: {league.stats.videos} | Votos: {league.stats.votes} | Participantes: {league.stats.participants}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleToggleStatus(league.round, league.isActive, league.year)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    league.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                  }`}
                >
                  {league.isActive ? 'Activa' : 'Cerrada'}
                </button>
                <button
                  onClick={() => handleDeleteLeague(league.round, league.year, league.name || `Liga ${league.round}`)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors"
                  title="Eliminar liga"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para pestaña de Rankings
const RankingsTab: React.FC = () => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', round: '', year: '' });

  const loadRankings = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) return;
      
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.round) params.round = Number(filters.round);
      if (filters.year) params.year = Number(filters.year);
      
      const data = await api.getAdminRankings(params, token);
      setRankings(data.rankings || []);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [filters]);

  return (
    <div className="bg-card p-6 rounded-xl border border-white/5">
      <h2 className="text-2xl font-bold text-white mb-4">Rankings Detallados</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="bg-darker border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
          <option value="">Todas las categorías</option>
          <option value="BEST_VIDEO">Mejor Videoclip</option>
          <option value="BEST_DIRECTION">Mejor Dirección</option>
          <option value="BEST_PHOTOGRAPHY">Mejor Fotografía</option>
          <option value="BEST_ART">Mejor Arte</option>
          <option value="BEST_EDITING">Mejor Montaje</option>
          <option value="BEST_COLOR">Mejor Color</option>
        </select>
        <input
          type="number"
          placeholder="Liga (1-6)"
          value={filters.round}
          onChange={(e) => setFilters({ ...filters, round: e.target.value })}
          className="bg-darker border border-gray-700 rounded-lg px-3 py-2 text-white"
        />
        <input
          type="number"
          placeholder="Año"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="bg-darker border border-gray-700 rounded-lg px-3 py-2 text-white"
        />
      </div>

      {loading ? (
        <LoadingSpinner size="md" text="Cargando rankings..." />
      ) : (
        <div className="space-y-2">
          {rankings.slice(0, 20).map((item) => (
            <div key={item.video.id} className="bg-darker p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-primary font-bold mr-2">#{item.position}</span>
                <span className="text-white font-medium">{item.video.title}</span>
                <span className="text-gray-400 text-sm ml-2">por {item.video.author.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{item.video.totalPoints} pts</div>
                <div className="text-xs text-gray-500">
                  Público: {item.video.publicVotes} | Jurado: {item.video.juryPoints}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para pestaña de Premios
const AwardsTab: React.FC = () => {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAwards();
  }, [year]);

  const loadAwards = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) return;
      const data = await api.getAdminAwards(year, token);
      setAwards(data.awards || []);
    } catch (error) {
      console.error('Error loading awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!confirm('¿Calcular premios para este año? Esto actualizará los ganadores.')) return;
    
    try {
      const token = authService.getToken();
      if (!token) return;
      await api.calculateAwards(year, token);
      loadAwards();
      alert('Premios calculados correctamente');
    } catch (error: any) {
      alert(error.message || 'Error al calcular premios');
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Gestión de Premios</h2>
        <div className="flex gap-2">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-darker border border-gray-700 rounded-lg px-3 py-2 text-white w-24"
          />
          <button
            onClick={handleCalculate}
            className="bg-secondary hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
          >
            Calcular Premios {year}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="md" text="Cargando premios..." />
      ) : (
        <div className="space-y-3">
          {awards.length === 0 ? (
            <p className="text-gray-400">No hay premios para este año</p>
          ) : (
            awards.map((award) => (
              <div key={award.id} className="bg-darker p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold">{award.category}</h3>
                    <p className="text-gray-400 text-sm mt-1">{award.prize}</p>
                    <p className="text-secondary text-sm mt-1">Ganador: {award.user.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-bold text-lg">{award.prizeValue}€</p>
                    <p className="text-gray-500 text-xs">{award.year}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Admin: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leagues' | 'rankings' | 'awards' | 'users'>('dashboard');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        showWarning('Debes iniciar sesión como administrador');
        setLoading(false);
        return;
      }

      const params: any = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      console.log('[ADMIN] Cargando dashboard con params:', params);
      const response = await api.getAdminDashboard(params, token);
      console.log('[ADMIN] Respuesta del backend:', response);
      
      // El backend devuelve los datos directamente, no dentro de dashboard
      // Verificar si viene dentro de dashboard o directamente
      const dashboardData = response.dashboard || response;
      console.log('[ADMIN] Datos del dashboard:', dashboardData);
      
      // Validar que tenga la estructura esperada
      if (dashboardData && typeof dashboardData === 'object' && dashboardData.users) {
        setStats(dashboardData as DashboardStats);
      } else {
        console.error('[ADMIN] Estructura de datos inesperada:', dashboardData);
        throw new Error('El servidor devolvió datos en un formato inesperado');
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('[ADMIN] Error al cargar dashboard:', error);
      setLoading(false);
      
      // Manejar error específico de configuración faltante
      if (error?.message?.includes('Configuración de administrador no encontrada') || 
          error?.response?.data?.error?.includes('Configuración de administrador')) {
        showError(
          'Error de configuración: El servidor backend no tiene configurado ADMIN_EMAILS. Por favor, configura ADMIN_EMAILS en server/.env y reinicia el servidor.'
        );
        return;
      }
      
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const errorMessage = error?.message || error?.response?.data?.message || `Error al cargar el panel de administración. Verifica que el servidor backend esté corriendo en ${backendUrl}`;
      showError(getFriendlyErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando panel de administración..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Error al cargar estadísticas</p>
          <button
            onClick={loadDashboard}
            className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Panel de Administración" />
      <div className="min-h-screen bg-dark py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-gray-400">Gestión completa de Go2Motion Awards</p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-card p-4 rounded-xl border border-white/5 mb-6 flex gap-4 items-end">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Fecha Inicio</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-darker border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Fecha Fin</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-darker border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
            >
              Limpiar
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'leagues', label: 'Ligas', icon: Calendar },
              { id: 'rankings', label: 'Rankings', icon: TrendingUp },
              { id: 'awards', label: 'Premios', icon: Trophy },
              { id: 'users', label: 'Usuarios', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-card text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-card p-6 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="text-blue-400" size={24} />
                    <span className="text-2xl font-bold text-white">{stats.users.total}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Total Usuarios</p>
                  <div className="mt-4 text-xs text-gray-500">
                    <div>Votantes: {stats.users.voters}</div>
                    <div>Participantes: {stats.users.participants}</div>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <Video className="text-purple-400" size={24} />
                    <span className="text-2xl font-bold text-white">{stats.videos.total}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Total Videos</p>
                </div>

                <div className="bg-card p-6 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-green-400" size={24} />
                    <span className="text-2xl font-bold text-white">{stats.votes.total}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Total Votos</p>
                </div>

                <div className="bg-card p-6 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="text-yellow-400" size={24} />
                    <span className="text-2xl font-bold text-white">{stats.payments.revenue.toFixed(2)}€</span>
                  </div>
                  <p className="text-gray-400 text-sm">Ingresos Totales</p>
                  <div className="mt-4 text-xs text-gray-500">
                    <div>Completados: {stats.payments.completed}</div>
                    <div>Pendientes: {stats.payments.pending}</div>
                  </div>
                </div>
              </div>

              {/* Videos by Category */}
              <div className="bg-card p-6 rounded-xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Videos por Categoría</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.videos.byCategory.map((item: any, idx: number) => (
                    <div key={idx} className="bg-darker p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Categoría</p>
                      <p className="text-white font-bold">{item._count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos by Round */}
              <div className="bg-card p-6 rounded-xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Videos por Liga</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {stats.videos.byRound.map((item: any) => (
                    <div key={item.round} className="bg-darker p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-sm mb-1">Liga {item.round}</p>
                      <p className="text-white font-bold text-xl">{item._count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leagues Tab */}
          {activeTab === 'leagues' && (
            <LeaguesTab stats={stats} />
          )}

          {/* Rankings Tab */}
          {activeTab === 'rankings' && (
            <RankingsTab />
          )}

          {/* Awards Tab */}
          {activeTab === 'awards' && (
            <AwardsTab />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-card p-6 rounded-xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-4">Estadísticas de Usuarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-darker p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Votantes</p>
                  <p className="text-white font-bold text-2xl">{stats.users.byRole.voters}</p>
                </div>
                <div className="bg-darker p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Individuales</p>
                  <p className="text-white font-bold text-2xl">{stats.users.byRole.individual}</p>
                </div>
                <div className="bg-darker p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Equipos</p>
                  <p className="text-white font-bold text-2xl">{stats.users.byRole.teams}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;

