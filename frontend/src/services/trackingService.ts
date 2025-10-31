// src/services/trackingService.ts
import api from './api'; // Instance Axios configurée
import { normalizeReference } from '../utils/references';

// Interfaces pour typer les données de suivi de colis
export interface ColisTrackingHistoryItem {
  statut: string;
  description: string;
  date: string; // Format ISO
  utilisateur?: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

export interface PointRelais {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
}

export interface ColisTrackingDetails {
  id: string;
  reference: string;
  expediteur: {
    id: string;
    nom: string;
  };
  destinataire: {
    nom: string;
    telephone: string;
    adresse: string;
    ville: string;
  };
  pointRelais?: PointRelais; // Si typeLivraison = 'point_relais'
  typeLivraison: 'domicile' | 'point_relais';
  details_colis: {
    poids: number;
    description?: string;
  };
  tarif: {
    frais_transport: number;
    total: number;
  };
  statut: string;
  historique: ColisTrackingHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Interfaces pour typer les données de suivi de mandat
export interface MandatTrackingHistoryItem {
  statut: string;
  description: string;
  date: string; // Format ISO
  utilisateur?: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

export interface MandatTrackingDetails {
  id: string;
  reference: string;
  client: {
    id: string;
    nom: string;
  };
  type_document: {
    id: string;
    nom: string;
    description?: string;
  };
  administration: {
    id: string;
    nom: string;
    ville: string;
  };
  informations_document: {
    nom_complet: string;
    // ... autres champs
  };
  livraison: {
    adresse: string;
    ville: string;
    telephone: string;
  };
  tarif: {
    frais_administratifs: number;
    frais_service: number;
    frais_livraison: number;
    total: number;
  };
  statut: string;
  historique: MandatTrackingHistoryItem[];
  documents: Array<{
    type_document: string; // 'cni', 'procuration', etc.
    nom_fichier: string;
    url: string;
    date_upload: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Réponses de l'API
interface TrackColisResponse {
  status: 'success';
  data: {
    colis: ColisTrackingDetails;
  };
}

interface TrackMandatResponse {
  status: 'success';
  data: {
    mandat: MandatTrackingDetails;
  };
}

// Service de suivi
export const trackingService = {
  /**
   * Suivre un colis par sa référence publique.
   * @param reference Référence du colis (ex: CLS-2025-001)
   * @returns Promesse résolue avec les détails du colis
   * @throws {Error} Si la référence est invalide ou si le colis n'est pas trouvé
   */
  trackColis: async (reference: string): Promise<TrackColisResponse> => {
    try {
      const normalizedRef = normalizeReference(reference);
      if (!normalizedRef.startsWith('CLS-') && !normalizedRef.startsWith('SHP-')) {
        throw new Error('Format de référence invalide pour un colis');
      }
      const response = await api.get(`/api/colis/track/${normalizedRef}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Colis non trouvé');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Suivre un mandat par sa référence publique.
   * @param reference Référence du mandat (ex: MND-2025-001)
   * @returns Promesse résolue avec les détails du mandat
   * @throws {Error} Si la référence est invalide ou si le mandat n'est pas trouvé
   */
  trackMandat: async (reference: string): Promise<TrackMandatResponse> => {
    try {
      const normalizedRef = normalizeReference(reference);
      if (!normalizedRef.startsWith('MND-')) {
        throw new Error('Format de référence invalide pour un mandat');
      }
      const response = await api.get(`/api/mandats/track/${normalizedRef}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Mandat non trouvé');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
};
