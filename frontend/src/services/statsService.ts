// plateforme-logistique/frontend/src/services/statsService.ts
import api from './api';

interface ClientStatsResponse {
  status: 'success';
  data: {
    stats: {
      colis: {
        total: number;
        en_attente: number;
        en_cours: number;
        livres: number;
        depenses_total: number;
      };
      mandats: {
        total: number;
        en_attente: number;
        en_cours: number;
        completes: number;
        depenses_total: number;
      };
      derniers_colis: any[]; // Remplacez 'any' par le type spécifique de Colis
      derniers_mandats: any[]; // Remplacez 'any' par le type spécifique de Mandat
      resume: {
        total_commandes: number;
        total_depenses: number;
        en_cours: number;
        taux_success: string;
      };
    };
  };
}

export const statsService = {
  getClientStats: (): Promise<ClientStatsResponse> =>
    api.get('/api/stats/client').then(res => res.data),

  getAdminStats: () => api.get('/api/stats/admin').then(res => res.data),

  getLivreurStats: () => api.get('/api/stats/livreur').then(res => res.data),
};