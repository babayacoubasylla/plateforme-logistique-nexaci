import { CheckCircle, Package, Download, Home } from 'lucide-react';
import { ShippingData } from '../../types/shipping';

interface ShippingConfirmationProps {
  data: ShippingData;
  trackingNumber: string;
  onBackToHome: () => void;
}

export default function ShippingConfirmation({ data, trackingNumber, onBackToHome }: ShippingConfirmationProps) {
  const handleDownloadReceipt = async () => {
    try {
      const apiModule = await import('../../services/api');
      const api = apiModule.default;
      const res = await api.get(`/api/colis/receipt/ref/${trackingNumber}` as const, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-colis-${trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur lors du téléchargement du reçu colis:', e);
      alert("Impossible de télécharger le reçu. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Envoi confirmé !</h1>
          <p className="text-gray-600 mb-8">
            Votre colis a été enregistré avec succès et sera bientôt pris en charge
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Numéro de suivi</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">{trackingNumber}</div>
            <p className="text-sm text-emerald-700">
              Conservez ce numéro pour suivre votre colis
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif de l'envoi</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Expéditeur</span>
                <span className="font-medium text-gray-900">{data.senderName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Destinataire</span>
                <span className="font-medium text-gray-900">{data.receiverName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Type de colis</span>
                <span className="font-medium text-gray-900">{data.packageType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Poids</span>
                <span className="font-medium text-gray-900">{data.packageWeight}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Mode de livraison</span>
                <span className="font-medium text-gray-900">
                  {data.deliveryOption === 'home' ? 'À domicile' : 'Point relais'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Vous recevrez un SMS de confirmation avec votre numéro de suivi</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Notre équipe prendra en charge votre colis dans les 24h</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Suivez votre envoi en temps réel via le numéro de suivi</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBackToHome}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger le reçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
