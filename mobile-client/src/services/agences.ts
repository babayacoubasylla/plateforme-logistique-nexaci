import { api } from '@/services/api';

export const getAgences = () => api.get('/api/agences');
