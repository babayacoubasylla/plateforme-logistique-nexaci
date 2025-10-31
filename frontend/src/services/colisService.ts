// plateforme-logistique/frontend/src/services/colisService.ts
import api from './api';

interface CreateColisData {
  destinataire: {
    nom: string;
    telephone: string;
    adresse: string;
    ville: string;
  };
  details_colis: {
    poids: number;
    description?: string;
  };
  paiement: {
    methode: string;
  };
  typeLivraison?: 'domicile' | 'point_relais';
  agenceId?: string;
}

interface ColisResponse {
  status: 'success';
  data: {
    colis: any; // Remplacez 'any' par le type spécifique de Colis
  };
}

interface MyColisResponse {
  status: 'success';
  results: number;
  data: {
    colis: any[]; // Remplacez 'any' par le type spécifique de Colis
  };
}

export const colisService = {
  createColis: (colisData: CreateColisData): Promise<ColisResponse> =>
    api.post('/api/colis', colisData).then(res => res.data),

  getMyColis: (): Promise<MyColisResponse> =>
    api.get('/api/colis/my-colis').then(res => res.data),

  downloadReceiptByReference: (reference: string): Promise<Blob> =>
    api.get(`/api/colis/receipt/ref/${reference}`, { responseType: 'blob' }).then(res => res.data)

  // Ajoutez d'autres fonctions si nécessaire (getColis, updateColisStatus, etc.)
};