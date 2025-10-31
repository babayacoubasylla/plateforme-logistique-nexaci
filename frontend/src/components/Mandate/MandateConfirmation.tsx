import { CheckCircle, FileText, Download, Home } from 'lucide-react';
import { MandateData } from './MandateForm';

interface MandateConfirmationProps {
  data: MandateData;
  requestNumber: string;
  onBackToHome: () => void;
}

export default function MandateConfirmation({ data, requestNumber, onBackToHome }: MandateConfirmationProps) {
  const documentTypes: { [key: string]: string } = {
    birth: 'Extrait de naissance',
    marriage: 'Acte de mariage',
    death: 'Acte de décès',
    residence: 'Certificat de résidence',
    id: 'Copie CNI'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demande enregistrée !</h1>
          <p className="text-gray-600 mb-8">
            Votre demande de mandat administratif a été confirmée avec succès
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Numéro de demande</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{requestNumber}</div>
            <p className="text-sm text-blue-700">
              Conservez ce numéro pour suivre votre demande
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif de la demande</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Type de document</span>
                <span className="font-medium text-gray-900">{documentTypes[data.documentType]}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Demandeur</span>
                <span className="font-medium text-gray-900">{data.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Lieu de naissance</span>
                <span className="font-medium text-gray-900">{data.placeOfBirth}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Traitement</span>
                <span className="font-medium text-gray-900">
                  {data.urgency === 'express' ? 'Express' : 'Normal'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium text-gray-900">{data.deliveryAddress}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
            <h4 className="font-semibold text-amber-900 mb-2">Prochaines étapes</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Un mandataire certifié sera assigné à votre dossier</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Il se rendra dans votre zone de naissance pour la démarche</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Vous recevrez des notifications à chaque étape du processus</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Le document vous sera livré à l'adresse indiquée</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBackToHome}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>
            <button className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Télécharger le reçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
