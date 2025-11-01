import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/config';

export const api = axios.create({ baseURL: API_URL, timeout: 30000 }); // 30s pour cold start Render
console.log('[mobile-client] 🌐 API_URL =', API_URL);

api.interceptors.request.use(async (config) => {
  console.log(`[mobile-client] 📤 ${config.method?.toUpperCase()} ${config.url}`);
  const token = await AsyncStorage.getItem('token');
  if (token) {
    console.log('[mobile-client] 🔑 Token présent, ajout Authorization header');
    config.headers = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    } as any;
  } else {
    console.log('[mobile-client] ⚠️  Pas de token trouvé');
  }
  return config;
});

api.interceptors.response.use(
  (resp) => {
    console.log(`[mobile-client] ✅ ${resp.config.method?.toUpperCase()} ${resp.config.url} → ${resp.status}`);
    return resp;
  },
  (error) => {
    console.error('[mobile-client] ❌ Erreur interceptée:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      code: error.code,
      message: error.message,
      data: error.response?.data
    });
    
    if (error?.response?.status === 401) {
      console.log('[mobile-client] 🚪 401 Unauthorized, nettoyage session');
      error.message = 'Session expirée. Veuillez vous reconnecter.';
      try { AsyncStorage.removeItem('token'); AsyncStorage.removeItem('user'); } catch {}
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.log('[mobile-client] ⏱️  Timeout détecté');
      error.message = `Délai dépassé (30s). Le serveur met trop de temps à répondre. API: ${API_URL}`;
    } else if (error.message === 'Network Error') {
      console.log('[mobile-client] 🔌 Network Error détecté');
      error.message = `Erreur réseau. Impossible de joindre l'API à ${API_URL}. Vérifiez votre connexion Internet.`;
    }
    return Promise.reject(error);
  }
);

export const login = (email: string, password: string) => {
  console.log('[mobile-client] 🔐 Tentative de login pour:', email);
  return api.post('/api/auth/login', { email, password });
};

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
