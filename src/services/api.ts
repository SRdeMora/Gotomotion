// Usar ruta relativa para que el proxy de Vite funcione
// En desarrollo: /api -> proxy -> http://localhost:5000/api
// En producción: usar VITE_API_URL si está configurado
const getApiUrl = () => {
  // En desarrollo, usar ruta relativa para que Vite proxee
  if (import.meta.env.DEV) {
    return '/api';
  }
  // En producción, usar la URL completa si está configurada
  return import.meta.env.VITE_API_URL || '/api';
};

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;
    
    // No establecer Content-Type para FormData, el navegador lo hará automáticamente
    const isFormData = fetchOptions.body instanceof FormData;
    
    const headers: HeadersInit = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...fetchOptions.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Error ${response.status}: ${response.statusText}` };
        }
        
        // Convertir mensajes técnicos en mensajes amigables
        let friendlyMessage = errorData.error || errorData.message || `Error: ${response.statusText}`;
        
        // Mensajes específicos por código de estado
        if (response.status === 401) {
          friendlyMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (response.status === 403) {
          friendlyMessage = 'No tienes permisos para realizar esta acción.';
        } else if (response.status === 404) {
          friendlyMessage = 'No se encontró el recurso solicitado.';
        } else if (response.status === 500) {
          friendlyMessage = 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.';
        } else if (response.status === 503) {
          friendlyMessage = 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.';
        }
        
        const customError: any = new Error(friendlyMessage);
        customError.status = response.status;
        customError.response = { data: errorData, status: response.status };
        customError.originalMessage = errorData.error || errorData.message; // Guardar mensaje original para logging
        console.error(`[API] Error ${response.status} en ${endpoint}:`, errorData);
        throw customError;
      }

      const data = await response.json();
      console.log(`[API] Respuesta de ${endpoint}:`, data);
      return data;
    } catch (error: any) {
      // Mejorar mensajes de error para conexión
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        throw new Error(
          `No se puede conectar al servidor. Verifica que el backend está corriendo en ${backendUrl}`
        );
      }
      throw error;
    }
  }

  // Auth
  async register(data: {
    email: string;
    name: string;
    password: string;
    role: string;
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(token: string) {
    return this.request<{ user: any }>('/auth/me', {
      method: 'GET',
      token,
    });
  }

  // Videos
  async getVideos(params?: {
    category?: string;
    search?: string;
    round?: number;
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ videos: any[]; pagination: any }>(
      `/videos${query ? `?${query}` : ''}`
    );
  }

  async getVideo(id: string) {
    // El backend devuelve el video directamente, no dentro de { video: ... }
    return this.request<any>(`/videos/${id}`);
  }

  async createVideo(data: FormData, token: string) {
    return this.request<{ video: any }>('/videos', {
      method: 'POST',
      token,
      body: data,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Votes
  async vote(videoId: string, category: string, token: string) {
    return this.request<{ vote: any; message: string }>(`/votes/${videoId}`, {
      method: 'POST',
      token,
      body: JSON.stringify({ category }),
    });
  }

  async unvote(videoId: string, token: string) {
    return this.request<{ message: string }>(`/votes/${videoId}`, {
      method: 'DELETE',
      token,
    });
  }

  async checkVote(videoId: string, token: string) {
    return this.request<{ hasVoted: boolean }>(`/votes/${videoId}/check`, {
      method: 'GET',
      token,
    });
  }

  // Ranking
  async getRanking(params?: {
    round?: number;
    year?: number;
    category?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ ranking: any[] }>(`/ranking${query ? `?${query}` : ''}`);
  }

  // Forum
  async getForumTopics(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ topics: any[]; pagination: any }>(
      `/forum/topics${query ? `?${query}` : ''}`
    );
  }

  async getForumTopic(id: string) {
    return this.request<{ topic: any }>(`/forum/topics/${id}`);
  }

  async createForumTopic(
    data: { title: string; content: string; category: string },
    token: string
  ) {
    return this.request<{ topic: any }>('/forum/topics', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async createForumReply(
    topicId: string,
    content: string,
    token: string
  ) {
    return this.request<{ reply: any }>(`/forum/topics/${topicId}/replies`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  }

  // Users
  async getUser(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateUser(
    id: string, 
    data: { 
      name?: string; 
      bio?: string; 
      sector?: string;
      teamMembers?: string[];
      socials?: {
        web?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
      };
    }, 
    token: string
  ) {
    return this.request<{ user: any }>(`/users/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(id: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<{ user: any; message: string }>(`/users/${id}/avatar`, {
      method: 'POST',
      token,
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async updateUserRole(id: string, role: 'PARTICIPANT_INDIVIDUAL' | 'PARTICIPANT_TEAM', token: string) {
    return this.request<{ user: any; message: string }>(`/users/${id}/role`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ role }),
    });
  }

  // Admin endpoints
  async getAdminDiagnostics(token?: string) {
    return this.request<{
      configured: boolean;
      adminEmailsRaw: string;
      adminEmails: string[];
      userEmail: string;
      isAdmin: boolean;
      envLoaded: boolean;
      allEnvKeys: string[];
    }>('/admin/diagnostics', {
      method: 'GET',
      token,
    });
  }

  async getAdminDashboard(params?: { startDate?: string; endDate?: string }, token?: string) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const query = queryParams.toString();
    const url = `/admin/dashboard${query ? `?${query}` : ''}`;
    console.log('[API] Llamando a:', url);
    return this.request<any>(url, {
      method: 'GET',
      token,
    });
  }

  async getAdminLeagues(token: string) {
    return this.request<{ leagues: any[] }>('/admin/leagues', {
      method: 'GET',
      token,
    });
  }

  async getAdminRankings(params?: { category?: string; round?: number; year?: number }, token?: string) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return this.request<{ rankings: any[] }>(`/admin/rankings${query ? `?${query}` : ''}`, {
      method: 'GET',
      token,
    });
  }

  async getAdminAwards(year?: number, token?: string) {
    const query = year ? `?year=${year}` : '';
    return this.request<{ awards: any[] }>(`/admin/awards${query}`, {
      method: 'GET',
      token,
    });
  }

  async calculateAwards(year: number, token: string) {
    return this.request<{ awards: any[] }>('/admin/awards/calculate', {
      method: 'POST',
      token,
      body: JSON.stringify({ year }),
    });
  }

  async updateAward(id: string, data: { prize?: string; prizeValue?: number }, token: string) {
    return this.request<{ award: any }>(`/admin/awards/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async createLeague(data: {
    round: number;
    year: number;
    name?: string;
    startDate: string;
    endDate: string;
    juryEndDate: string;
  }, token: string) {
    return this.request<{ league: any }>('/admin/leagues', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateLeagueStatus(round: number, isActive: boolean, token: string, year?: number) {
    const query = year ? `?year=${year}` : '';
    return this.request<{ league: any }>(`/admin/leagues/${round}/status${query}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteLeague(round: number, token: string, year?: number) {
    const query = year ? `?year=${year}` : '';
    return this.request<{ message: string }>(`/admin/leagues/${round}${query}`, {
      method: 'DELETE',
      token,
    });
  }
}

export const api = new ApiService();

