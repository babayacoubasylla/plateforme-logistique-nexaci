import api from './api';

export interface Agence {
  _id?: string; // Mongoose id (optionnel)
  id: string;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  telephone: string;
  email?: string;
  localisation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  gerant_id?: string;
  statut: 'active' | 'inactive' | 'maintenance';
  horaires?: {
    lundi?: { ouverture: string; fermeture: string };
    mardi?: { ouverture: string; fermeture: string };
    mercredi?: { ouverture: string; fermeture: string };
    jeudi?: { ouverture: string; fermeture: string };
    vendredi?: { ouverture: string; fermeture: string };
    samedi?: { ouverture: string; fermeture: string };
    dimanche?: { ouverture: string; fermeture: string };
  };
  capacite_stock: number;
}

export interface CreateAgenceData {
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  telephone: string;
  email?: string;
  localisation?: {
    coordinates: [number, number];
  };
  gerant_id?: string;
  horaires?: Agence['horaires'];
  capacite_stock?: number;
}

export interface UpdateAgenceData extends Partial<CreateAgenceData> {
  statut?: Agence['statut'];
}

interface AgenceResponse {
  status: string;
  data: {
    agence: Agence;
  };
}

interface AgencesResponse {
  status: string;
  results: number;
  data: {
    agences: Agence[];
  };
}

export const agenceService = {
  // Récupérer toutes les agences actives
  getAllAgences: async (): Promise<AgencesResponse> => {
    const response = await api.get('/api/agences');
    return response.data;
  },

  // Récupérer une agence par son ID
  getAgenceById: async (id: string): Promise<AgenceResponse> => {
    const response = await api.get(`/api/agences/${id}`);
    return response.data;
  },

  // Créer une nouvelle agence
  createAgence: async (data: CreateAgenceData): Promise<AgenceResponse> => {
    const response = await api.post('/api/agences', data);
    return response.data;
  },

  // Mettre à jour une agence
  updateAgence: async (id: string, data: UpdateAgenceData): Promise<AgenceResponse> => {
    const response = await api.patch(`/api/agences/${id}`, data);
    return response.data;
  },

  // Supprimer une agence (ou la désactiver)
  deleteAgence: async (id: string): Promise<void> => {
    await api.delete(`/api/agences/${id}`);
  },

  // Rechercher les agences par ville
  searchAgencesByCity: async (ville: string): Promise<AgencesResponse> => {
    const response = await api.get(`/api/agences/search?ville=${encodeURIComponent(ville)}`);
    return response.data;
  },

  // Trouver les agences les plus proches d'une position
  findNearestAgences: async (
    latitude: number,
    longitude: number,
    maxDistance: number = 10000 // 10km par défaut
  ): Promise<AgencesResponse> => {
    const response = await api.get(
      `/api/agences/nearest?lat=${latitude}&lng=${longitude}&maxDistance=${maxDistance}`
    );
    return response.data;
  },

  // Vérifier la disponibilité d'une agence
  checkAgenceAvailability: async (
    agenceId: string,
    date?: Date
  ): Promise<{ available: boolean; nextAvailableSlot?: Date }> => {
    const response = await api.get(`/api/agences/${agenceId}/availability`, {
      params: { date: date?.toISOString() }
    });
    return response.data;
  }
};