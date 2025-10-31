import { api } from '@/services/api';

export const getClientStats = () => api.get('/api/stats/client');
