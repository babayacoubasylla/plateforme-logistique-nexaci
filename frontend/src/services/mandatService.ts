// plateforme-logistique/frontend/src/services/mandatService.ts
import api from './api';

interface CreateMandatData {
  type_document: string; // ID
  administration: string; // ID
  informations_document: {
    nom_complet: string;
    date_naissance?: string;
    lieu_naissance?: string;
    // ... autres champs spécifiques
  };
  livraison: {
    adresse: string;
    ville: string;
    telephone: string;
  };
  paiement: {
    methode: string;
  };
}

interface MandatResponse {
  status: 'success';
  data: {
    mandat: any; // Remplacez 'any' par le type spécifique de Mandat
  };
}

interface MyMandatsResponse {
  status: 'success';
  results: number;
  data: {
    mandats: any[]; // Remplacez 'any' par le type spécifique de Mandat
  };
}

export const mandatService = {
  createMandat: (mandatData: CreateMandatData): Promise<MandatResponse> =>
    api.post('/api/mandats', mandatData).then(res => res.data),

  getMyMandats: (): Promise<MyMandatsResponse> =>
    api.get('/api/mandats/my-mandats').then(res => res.data),

  getAssignedMandats: (statut?: string) =>
    api.get('/api/mandats/assigned', { params: { statut } }).then(res => res.data),

  updateMandatStatus: (mandatId: string, statut: string) =>
    api.patch(`/api/mandats/${mandatId}/status`, { statut }).then(res => res.data),

  downloadReceiptByReference: (reference: string): Promise<Blob> =>
    api.get(`/api/mandats/receipt/ref/${reference}`, { responseType: 'blob' }).then(res => res.data)

  // Ajoutez d'autres fonctions si nécessaire (getMandat, uploadDocuments, etc.)
};