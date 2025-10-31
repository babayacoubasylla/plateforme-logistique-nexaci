import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/config';

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });
console.log('[mobile-livreur] API_URL =', API_URL);

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    } as any;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      error.message = 'Session expirée. Veuillez vous reconnecter.';
      try { AsyncStorage.removeItem('token'); AsyncStorage.removeItem('user'); } catch {}
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = "Délai dépassé. Vérifiez votre connexion et l'API (API_URL).";
    } else if (error.message === 'Network Error') {
      error.message = "Erreur réseau. Assurez-vous que le téléphone et le serveur sont sur le même réseau et que l'API est accessible.";
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

// Colis assignés au livreur
export const getMyAssignedColis = () => api.get('/api/colis/assigned');

// Mettre à jour le statut d'un colis
export const updateColisStatus = (colisId: string, statut: string, commentaire?: string) =>
  api.patch(`/api/colis/${colisId}/status`, { statut, commentaire });

// Obtenir les détails d'un colis
export const getColisDetails = (colisId: string) => api.get(`/api/colis/${colisId}`);

// Historique des colis terminés du livreur
export const getMyHistory = (params?: any) => api.get('/api/colis/history/my', { params });
