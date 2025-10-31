import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/config';

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });
console.log('[mobile-client] API_URL =', API_URL);

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
      // Nettoyage basique (sans navigation ici)
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

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const getMyColis = () => api.get('/api/colis/my-colis');
export const createColis = (payload: any) => api.post('/api/colis', payload);

export const uploadColisPhoto = (id: string, file: { uri: string; name?: string; type?: string; }) => {
  const form = new FormData();
  form.append('photo', {
    uri: file.uri,
    name: file.name || 'colis.jpg',
    type: file.type || 'image/jpeg'
  } as any);
  return api.patch(`/api/colis/${id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
