import { api } from '@/services/api';

export const getLivreurStats = () => api.get('/api/stats/livreur');
