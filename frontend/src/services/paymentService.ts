// plateforme-logistique/frontend/src/services/paymentService.ts
import api from './api';

export interface PaymentRequest {
  amount: number;
  method: 'orange' | 'moov' | 'wave' | 'momo';
  phoneNumber: string;
  orderId: string;
  orderType: 'colis' | 'mandat';
}

export interface PaymentResponse {
  status: 'success' | 'pending' | 'failed';
  data: {
    transactionId: string;
    paymentUrl?: string;
    message: string;
  };
}

export interface PaymentVerification {
  status: 'success' | 'pending' | 'failed';
  data: {
    transactionId: string;
    paid: boolean;
    amount: number;
  };
}

export const paymentService = {
  /**
   * Initier un paiement mobile money
   */
  initiatePayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await api.post('/api/payments/initiate', paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
    }
  },

  /**
   * Vérifier le statut d'un paiement
   */
  verifyPayment: async (transactionId: string): Promise<PaymentVerification> => {
    try {
      const response = await api.get(`/api/payments/verify/${transactionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du paiement');
    }
  },

  /**
   * Obtenir l'historique des paiements
   */
  getPaymentHistory: async (): Promise<any> => {
    try {
      const response = await api.get('/api/payments/history');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  },

  /**
   * SIMULATION: Pour les tests sans vraie intégration
   * Cette méthode simule un paiement réussi après 2 secondes
   */
  simulatePayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          data: {
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message: `Paiement de ${paymentData.amount} FCFA via ${paymentData.method.toUpperCase()} simulé avec succès`
          }
        });
      }, 2000);
    });
  }
};
