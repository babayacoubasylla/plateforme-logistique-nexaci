import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/config';

export const api = axios.create({ baseURL: API_URL, timeout: 30000 }); // 30s pour cold start Render
console.log('[mobile-livreur] 🌐 API_URL =', API_URL);

api.interceptors.request.use(async (config) => {
  console.log(`[mobile-livreur] 📤 ${config.method?.toUpperCase()} ${config.url}`);
  const token = await AsyncStorage.getItem('token');
  if (token) {
    console.log('[mobile-livreur] 🔑 Token présent, ajout Authorization header');
    config.headers = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    } as any;
  } else {
    console.log('[mobile-livreur] ⚠️  Pas de token trouvé');
  }
  return config;
});

api.interceptors.response.use(
  (resp) => {
    console.log(`[mobile-livreur] ✅ ${resp.config.method?.toUpperCase()} ${resp.config.url} → ${resp.status}`);
    return resp;
  },
  (error) => {
    console.error('[mobile-livreur] ❌ Erreur interceptée:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      code: error.code,
      message: error.message,
      data: error.response?.data
    });
    
    if (error?.response?.status === 401) {
      console.log('[mobile-livreur] 🚪 401 Unauthorized, nettoyage session');
      error.message = 'Session expirée. Veuillez vous reconnecter.';
      try { AsyncStorage.removeItem('token'); AsyncStorage.removeItem('user'); } catch {}
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.log('[mobile-livreur] ⏱️  Timeout détecté');
      error.message = `Délai dépassé (30s). Le serveur met trop de temps à répondre. API: ${API_URL}`;
    } else if (error.message === 'Network Error') {
      console.log('[mobile-livreur] 🔌 Network Error détecté');
      error.message = `Erreur réseau. Impossible de joindre l'API à ${API_URL}. Vérifiez votre connexion Internet.`;
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) => {
  console.log('[mobile-livreur] 🔐 Tentative de login pour:', email);
  return api.post('/api/auth/login', { email, password });
};

// Colis assignés au livreur
export const getMyAssignedColis = () => api.get('/api/colis/assigned');

// Mettre à jour le statut d'un colis
export const updateColisStatus = (colisId: string, statut: string, commentaire?: string) =>
  api.patch(`/api/colis/${colisId}/status`, { statut, commentaire });

// Obtenir les détails d'un colis
export const getColisDetails = (colisId: string) => api.get(`/api/colis/${colisId}`);

// Historique des colis terminés du livreur
export const getMyHistory = (params?: any) => api.get('/api/colis/history/my', { params });
