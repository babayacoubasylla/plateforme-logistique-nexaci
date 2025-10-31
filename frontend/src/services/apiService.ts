// src/services/apiService.ts

import api from './api';

export const apiService = {
  // Utilisateurs
  async getUsers(role?: string) {
    console.log('🔍 [apiService] Appel de getUsers...');
    try {
      const response = await api.get('/api/users', { params: { role } });
      console.log('✅ [apiService] Réponse getUsers:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getUsers:', error);
      throw error;
    }
  },

  async createUser(userData: any) {
    console.log('📝 [apiService] Appel de createUser avec:', userData);
    try {
      const response = await api.post('/api/users', userData);
      console.log('✅ [apiService] Réponse createUser:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans createUser:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: any) {
    console.log('📝 [apiService] Appel de updateUser avec:', { userId, userData });
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      console.log('✅ [apiService] Réponse updateUser:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans updateUser:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    console.log('🗑️ [apiService] Appel de deleteUser avec:', userId);
    try {
      const response = await api.delete(`/api/users/${userId}`);
      console.log('✅ [apiService] Réponse deleteUser:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans deleteUser:', error);
      throw error;
    }
  },

  // Agences
  async getAgences() {
    console.log('🔍 [apiService] Appel de getAgences...');
    try {
      const response = await api.get('/api/agences');
      console.log('✅ [apiService] Réponse getAgences:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getAgences:', error);
      throw error;
    }
  },

  async createAgence(agenceData: any) {
    console.log('📝 [apiService] Appel de createAgence avec:', agenceData);
    console.log('📝 [apiService] Données envoyées:', JSON.stringify(agenceData, null, 2));
    try {
      const response = await api.post('/api/agences', agenceData);
      console.log('✅ [apiService] Réponse createAgence:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [apiService] Erreur dans createAgence:', error);
      if (error.response) {
        console.error('❌ [apiService] Détails de l\'erreur:', error.response.data);
        throw new Error(error.response.data.message || 'Erreur lors de la création de l\'agence');
      }
      throw error;
    }
  },

  async updateAgence(agenceId: string, agenceData: any) {
    console.log('📝 [apiService] Appel de updateAgence avec:', { agenceId, agenceData });
    try {
      const response = await api.patch(`/api/agences/${agenceId}`, agenceData);
      console.log('✅ [apiService] Réponse updateAgence:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans updateAgence:', error);
      throw error;
    }
  },

  async deleteAgence(agenceId: string) {
    console.log('🗑️ [apiService] Appel de deleteAgence avec:', agenceId);
    try {
      const response = await api.delete(`/api/agences/${agenceId}`);
      console.log('✅ [apiService] Réponse deleteAgence:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans deleteAgence:', error);
      throw error;
    }
  },

  // Colis
  async getColis() {
    console.log('🔍 [apiService] Appel de getColis...');
    try {
      const response = await api.get('/api/colis');
      console.log('✅ [apiService] Réponse getColis:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getColis:', error);
      throw error;
    }
  },

  async getColisByAgence(agenceId: string) {
    console.log('🔍 [apiService] Appel de getColisByAgence pour agence:', agenceId);
    try {
      const response = await api.get(`/api/colis/agence/${agenceId}`);
      console.log('✅ [apiService] Réponse getColisByAgence:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getColisByAgence:', error);
      throw error;
    }
  },

  async getAssignedColis(statut?: string) {
    console.log('🔍 [apiService] Appel de getAssignedColis...', statut ? { statut } : '');
    try {
      const response = await api.get('/api/colis/assigned', { params: { statut } });
      console.log('✅ [apiService] Réponse getAssignedColis:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getAssignedColis:', error);
      throw error;
    }
  },

  async createColis(colisData: any) {
    console.log('📝 [apiService] Appel de createColis avec:', colisData);
    try {
      const response = await api.post('/api/colis', colisData);
      console.log('✅ [apiService] Réponse createColis:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans createColis:', error);
      throw error;
    }
  },

  async updateColis(colisId: string, colisData: any) {
    console.log('📝 [apiService] Appel de updateColis avec:', { colisId, colisData });
    try {
      const response = await api.put(`/api/colis/${colisId}`, colisData);
      console.log('✅ [apiService] Réponse updateColis:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans updateColis:', error);
      throw error;
    }
  },

  async updateColisStatus(colisId: string, statut: string) {
    console.log('📝 [apiService] Appel de updateColisStatus avec:', { colisId, statut });
    try {
      const response = await api.patch(`/api/colis/${colisId}/status`, { statut });
      console.log('✅ [apiService] Réponse updateColisStatus:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans updateColisStatus:', error);
      throw error;
    }
  },

  async deleteColis(colisId: string) {
    console.log('🗑️ [apiService] Appel de deleteColis avec:', colisId);
    try {
      const response = await api.delete(`/api/colis/${colisId}`);
      console.log('✅ [apiService] Réponse deleteColis:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans deleteColis:', error);
      throw error;
    }
  },

  // Mandats
  async getMandats() {
    console.log('🔍 [apiService] Appel de getMandats...');
    try {
      const response = await api.get('/api/mandats');
      console.log('✅ [apiService] Réponse getMandats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getMandats:', error);
      throw error;
    }
  },

  async createMandat(mandatData: any) {
    console.log('📝 [apiService] Appel de createMandat avec:', mandatData);
    try {
      const response = await api.post('/api/mandats', mandatData);
      console.log('✅ [apiService] Réponse createMandat:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans createMandat:', error);
      throw error;
    }
  },

  async updateMandat(mandatId: string, mandatData: any) {
    console.log('📝 [apiService] Appel de updateMandat avec:', { mandatId, mandatData });
    try {
      const response = await api.put(`/api/mandats/${mandatId}`, mandatData);
      console.log('✅ [apiService] Réponse updateMandat:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans updateMandat:', error);
      throw error;
    }
  },

  async deleteMandat(mandatId: string) {
    console.log('🗑️ [apiService] Appel de deleteMandat avec:', mandatId);
    try {
      const response = await api.delete(`/api/mandats/${mandatId}`);
      console.log('✅ [apiService] Réponse deleteMandat:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans deleteMandat:', error);
      throw error;
    }
  },

  // Coursiers
  async getCoursiers(agenceId: string) {
    console.log('🔍 [apiService] Appel de getCoursiers pour agence:', agenceId);
    try {
      const response = await api.get(`/api/agences/${agenceId}/coursiers`);
      console.log('✅ [apiService] Réponse getCoursiers:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getCoursiers:', error);
      throw error;
    }
  },

  async assignCourier(agenceId: string, coursier_id: string, colisId?: string, mandatId?: string) {
    console.log('📝 [apiService] Appel de assignCourier avec:', { agenceId, coursier_id, colisId, mandatId });
    try {
      let endpoint = '';
      if (colisId) {
        endpoint = `/api/colis/${colisId}/assign`;
      } else if (mandatId) {
        endpoint = `/api/mandats/${mandatId}/assign`;
      } else {
        throw new Error('Il faut spécifier soit un colisId soit un mandatId');
      }

      const response = await api.patch(endpoint, { coursier_id });
      console.log('✅ [apiService] Réponse assignCourier:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans assignCourier:', error);
      throw error;
    }
  },

  // Statistiques et rapports
  async getAgenceStats(agenceId: string, periode: string) {
    console.log('🔍 [apiService] Appel de getAgenceStats avec:', { agenceId, periode });
    try {
      const response = await api.get(`/api/agences/${agenceId}/stats`, { params: { periode } });
      console.log('✅ [apiService] Réponse getAgenceStats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans getAgenceStats:', error);
      throw error;
    }
  },

  async exportAgenceReport(agenceId: string, periode: string) {
    console.log('📊 [apiService] Appel de exportAgenceReport avec:', { agenceId, periode });
    try {
      const response = await api.get(`/api/agences/${agenceId}/reports/export`, {
        params: { periode },
        responseType: 'blob'
      });
      console.log('✅ [apiService] Réponse exportAgenceReport reçue');
      return response;
    } catch (error) {
      console.error('❌ [apiService] Erreur dans exportAgenceReport:', error);
      throw error;
    }
  }
};