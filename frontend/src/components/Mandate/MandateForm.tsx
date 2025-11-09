import { useState, useEffect } from 'react';
import { FileText, User, MapPin, Upload, ArrowLeft, Wallet } from 'lucide-react';
import { mandatService } from '../../services/mandatService';

interface MandateFormProps {
  onBack: () => void;
  onSubmit: (data: MandateData) => void;
}

export interface MandateData {
  documentType: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  motherName: string;
  fatherName: string;
  currentAddress: string;
  currentLandmark: string;
  phone: string;
  deliveryAddress: string;
  deliveryLandmark: string;
  paymentMethod: string;
  urgency: string;
}

export default function MandateForm({ onBack, onSubmit }: MandateFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [administrations, setAdministrations] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  
  const [formData, setFormData] = useState<MandateData>({
    documentType: '',
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    motherName: '',
    fatherName: '',
    currentAddress: '',
    currentLandmark: '',
    phone: '',
    deliveryAddress: '',
    deliveryLandmark: '',
    paymentMethod: 'orange_money',
    urgency: 'normal'
  });

  // Charger les types de documents et administrations depuis le backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [typesRes, adminsRes] = await Promise.all([
          mandatService.getDocumentTypes(),
          mandatService.getAdministrations()
        ]);
        setDocumentTypes(typesRes.data.data || []);
        setAdministrations(adminsRes.data.data || []);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateField = (field: keyof MandateData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transformer les données pour l'API backend
    const mandatData = {
      type_document: formData.documentType,
      administration: selectedAdmin,
      informations_document: {
        nom_complet: formData.fullName,
        date_naissance: formData.dateOfBirth,
        lieu_naissance: formData.placeOfBirth,
        nom_pere: formData.fatherName,
        nom_mere: formData.motherName
      },
      livraison: {
        adresse: formData.deliveryAddress,
        ville: formData.deliveryAddress.split(',').pop()?.trim() || 'Abidjan',
        telephone: formData.phone
      },
      paiement: {
        methode: formData.paymentMethod
      }
    };
    
    onSubmit(mandatData);
  };

  // Types de documents ivoiriens
  const ivorianDocumentTypes = [
    { id: 'extrait_naissance', name: 'Extrait de naissance', price: '2.500 FCFA', delay: '2-3 jours', description: 'Document officiel de l\'état civil ivoirien' },
    { id: 'acte_naissance', name: 'Acte de naissance', price: '3.500 FCFA', delay: '3-5 jours', description: 'Copie intégrale de l\'acte de naissance' },
    { id: 'certificat_nationalite', name: 'Certificat de nationalité', price: '5.000 FCFA', delay: '5-7 jours', description: 'Justificatif de nationalité ivoirienne' },
    { id: 'acte_mariage', name: 'Acte de mariage', price: '4.000 FCFA', delay: '3-5 jours', description: 'Copie de l\'acte de mariage' },
    { id: 'acte_deces', name: 'Acte de décès', price: '3.000 FCFA', delay: '2-4 jours', description: 'Copie de l\'acte de décès' },
    { id: 'casier_judiciaire', name: 'Casier judiciaire', price: '2.000 FCFA', delay: '3-5 jours', description: 'Extrait du casier judiciaire' },
    { id: 'certificat_residence', name: 'Certificat de résidence', price: '1.500 FCFA', delay: '1-2 jours', description: 'Attestation de domicile' },
    { id: 'legalisation', name: 'Légalisation de documents', price: '1.000 FCFA', delay: '1-3 jours', description: 'Légalisation de signatures ou documents' }
  ];

  const paymentMethods = [
    { id: 'orange_money', name: 'Orange Money', logo: '🟠', description: 'Paiement mobile Orange CI' },
    { id: 'mtn_money', name: 'MTN Mobile Money', logo: '🟡', description: 'Paiement mobile MTN CI' },
    { id: 'moov_money', name: 'Moov Money', logo: '🔵', description: 'Paiement mobile Moov Africa' },
    { id: 'wave', name: 'Wave', logo: '💙', description: 'Transfert d\'argent Wave' },
    { id: 'especes', name: 'Espèces à la livraison', logo: '�', description: 'Paiement cash au livreur' }
  ];

  const selectedDoc = (documentTypes.length > 0 ? documentTypes : ivorianDocumentTypes)
    .find(d => d.id === formData.documentType || d._id === formData.documentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handlePrevious}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🇨🇮 Mandat Administratif - Côte d'Ivoire
          </h1>
          <p className="text-gray-600">
            Obtenez vos documents administratifs ivoiriens sans vous déplacer. 
            Service agréé pour toutes les mairies et administrations de Côte d'Ivoire.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                } font-semibold transition-colors`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > num ? 'bg-blue-600' : 'bg-gray-300'
                  } transition-colors`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Document</span>
            <span className="text-xs text-gray-600">Informations</span>
            <span className="text-xs text-gray-600">Livraison & Paiement</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Type de document</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Choisissez le document dont vous avez besoin</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Remplissez les informations nécessaires</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Notre mandataire se charge de la démarche dans votre zone de naissance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Recevez votre document à domicile ou en point relais</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sélectionnez le document
                  </label>
                  <div className="space-y-3">
                    {documentTypes.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => updateField('documentType', doc.id)}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                          formData.documentType === doc.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-600">Délai: {doc.delay}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{doc.price}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Urgence
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => updateField('urgency', 'normal')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.urgency === 'normal'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Normal</div>
                        <div className="text-sm text-gray-600">Délai standard</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('urgency', 'express')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.urgency === 'express'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Express</div>
                        <div className="text-sm text-gray-600">+2.000 FCFA</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Vos informations</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom et prénoms"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu de naissance
                    </label>
                    <input
                      type="text"
                      value={formData.placeOfBirth}
                      onChange={(e) => updateField('placeOfBirth', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ville/Commune"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la mère
                    </label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => updateField('motherName', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom complet de la mère"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du père
                    </label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom complet du père"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+225 07 XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Documents requis (optionnel)</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Téléchargez votre pièce d'identité (optionnel)
                    </p>
                    <p className="text-xs text-gray-500">
                      Format accepté: PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Livraison & Paiement</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de livraison
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) => updateField('deliveryAddress', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Commune, quartier"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Point de repère
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryLandmark}
                    onChange={(e) => updateField('deliveryLandmark', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Près de la station service"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Détail des frais</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Frais administratifs</span>
                      <span className="font-medium">{selectedDoc?.price || '0 FCFA'}</span>
                    </div>
                    {formData.urgency === 'express' && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Traitement express</span>
                        <span className="font-medium">2.000 FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-700">Frais de livraison</span>
                      <span className="font-medium">1.500 FCFA</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          {selectedDoc ?
                            parseInt(selectedDoc.price.replace(/[^\d]/g, '')) +
                            (formData.urgency === 'express' ? 2000 : 0) +
                            1500 : 0
                          } FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => updateField('paymentMethod', method.id)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{method.logo}</div>
                          <div className="font-semibold text-gray-900">{method.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Récapitulatif</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Document:</span> {selectedDoc?.name}</p>
                    <p><span className="text-gray-600">Demandeur:</span> {formData.fullName}</p>
                    <p><span className="text-gray-600">Lieu de naissance:</span> {formData.placeOfBirth}</p>
                    <p><span className="text-gray-600">Urgence:</span> {formData.urgency === 'express' ? 'Express' : 'Normal'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Confirmer la demande
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
