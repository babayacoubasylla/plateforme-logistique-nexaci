import { Agence } from '../services/agenceService';

export interface ShippingData {
  // Informations de l'expéditeur
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderLandmark: string;
  senderAgence: Agence | null;

  // Informations du destinataire
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverLandmark: string;
  receiverAgence: Agence | null;

  // Informations du colis
  packageType: string;
  packageWeight: string;
  packageDescription: string;

  // Options de livraison et paiement
  deliveryOption: 'home' | 'relay';
  paymentMethod: string;
}

export interface MandateData {
  // Informations de l'expéditeur
  senderName: string;
  senderPhone: string;
  senderAgence: Agence | null;
  senderIdType: 'cni' | 'passeport' | 'permis';
  senderIdNumber: string;

  // Informations du destinataire
  receiverName: string;
  receiverPhone: string;
  receiverAgence: Agence | null;
  
  // Informations du mandat
  amount: number;
  currency: 'XOF' | 'EUR' | 'USD';
  reason: string;
  urgent: boolean;

  // Mode de paiement
  paymentMethod: string;
}