import { useState, useEffect } from 'react';
import { FileText, User, MapPin, ArrowLeft, Wallet } from 'lucide-react';
import { mandatService } from '../../services/mandatService';

interface MandateFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export interface MandateData {
  documentType: string;
  administration: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  motherName: string;
  fatherName: string;
  currentAddress: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  urgency: string;
}

export default function MandateFormFixed({ onBack, onSubmit }: MandateFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [administrations, setAdministrations] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<MandateData>({
    documentType: '',
    administration: '',
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    motherName: '',
    fatherName: '',
    currentAddress: '',
    phone: '',
    deliveryAddress: '',
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
      administration: formData.administration,
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

  // Types de documents ivoiriens par défaut
  const ivorianDocumentTypes = [
    { 
      id: 'extrait_naissance', 
      name: 'Extrait de naissance', 
      price: '2.500 FCFA', 
      delay: '2-3 jours', 
      description: 'Document officiel de l\'état civil ivoirien' 
    },
    { 
      id: 'acte_naissance', 
      name: 'Acte de naissance', 
      price: '3.500 FCFA', 
      delay: '3-5 jours', 
      description: 'Copie intégrale de l\'acte de naissance' 
    },
    { 
      id: 'certificat_nationalite', 
      name: 'Certificat de nationalité', 
      price: '5.000 FCFA', 
      delay: '5-7 jours', 
      description: 'Justificatif de nationalité ivoirienne' 
    },
    { 
      id: 'acte_mariage', 
      name: 'Acte de mariage', 
      price: '4.000 FCFA', 
      delay: '3-5 jours', 
      description: 'Copie de l\'acte de mariage' 
    },
    { 
      id: 'acte_deces', 
      name: 'Acte de décès', 
      price: '3.000 FCFA', 
      delay: '2-4 jours', 
      description: 'Copie de l\'acte de décès' 
    },
    { 
      id: 'casier_judiciaire', 
      name: 'Casier judiciaire', 
      price: '2.000 FCFA', 
      delay: '3-5 jours', 
      description: 'Extrait du casier judiciaire' 
    },
    { 
      id: 'certificat_residence', 
      name: 'Certificat de résidence', 
      price: '1.500 FCFA', 
      delay: '1-2 jours', 
      description: 'Attestation de domicile' 
    },
    { 
      id: 'legalisation', 
      name: 'Légalisation de documents', 
      price: '1.000 FCFA', 
      delay: '1-3 jours', 
      description: 'Légalisation de signatures ou documents' 
    }
  ];

  const paymentMethods = [
    { id: 'orange_money', name: 'Orange Money', logo: '🟠', description: 'Paiement mobile Orange CI' },
    { id: 'mtn_money', name: 'MTN Mobile Money', logo: '🟡', description: 'Paiement mobile MTN CI' },
    { id: 'moov_money', name: 'Moov Money', logo: '🔵', description: 'Paiement mobile Moov Africa' },
    { id: 'wave', name: 'Wave', logo: '💙', description: 'Transfert d\'argent Wave' },
    { id: 'especes', name: 'Espèces à la livraison', logo: '💰', description: 'Paiement cash au livreur' }
  ];

  const documentsToDisplay = documentTypes.length > 0 ? documentTypes : ivorianDocumentTypes;
  const selectedDoc = documentsToDisplay.find(d => (d.id || d._id) === formData.documentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handlePrevious}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-900 transition-colors"
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
                  step >= num ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'
                } font-semibold transition-colors`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > num ? 'bg-orange-600' : 'bg-gray-300'
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
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Type de document</h2>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-orange-900 mb-2">🇨🇮 Service officiel - Comment ça marche ?</h3>
                  <ul className="space-y-2 text-sm text-orange-800">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Choisissez le document administratif ivoirien dont vous avez besoin</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Remplissez vos informations d'état civil (exactement comme sur vos documents)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Notre mandataire agréé se rend dans votre commune de naissance ou de résidence</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Recevez votre document officiel à domicile à Abidjan ou point relais</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    📋 Sélectionnez le document administratif ivoirien
                  </label>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <p className="mt-2 text-gray-600">Chargement des documents disponibles...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documentsToDisplay.map((doc) => (
                        <button
                          key={doc.id || doc._id}
                          type="button"
                          onClick={() => updateField('documentType', doc.id || doc._id)}
                          className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                            formData.documentType === (doc.id || doc._id)
                              ? 'border-orange-600 bg-orange-50 shadow-md'
                              : 'border-gray-300 hover:border-orange-400 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{doc.name || doc.nom}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {doc.description || `Délai: ${doc.delay || doc.delai || '2-5 jours'}`}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                ✅ Document officiel - Validité légale garantie
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-orange-600">
                                {doc.price || `${doc.frais_administratifs || 2500} FCFA`}
                              </div>
                              <div className="text-xs text-gray-500">
                                + frais livraison
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sélection de l'administration */}
                {formData.documentType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      🏢 Choisissez la commune/administration
                    </label>
                    {administrations.length > 0 ? (
                      <select
                        value={formData.administration}
                        onChange={(e) => updateField('administration', e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez votre commune...</option>
                        {administrations.map((admin) => (
                          <option key={admin._id} value={admin._id}>
                            {admin.nom} - {admin.ville} ({admin.region})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.administration}
                        onChange={(e) => updateField('administration', e.target.value)}
                        required
                        placeholder="Ex: Mairie de Cocody, Préfecture de Bouaké..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Renseignez vos informations exactement comme elles apparaissent 
                    sur vos documents d'état civil officiels.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet (comme sur l'acte de naissance)
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      required
                      placeholder="Ex: KOUASSI Yao Jean-Baptiste"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      placeholder="Ex: Abidjan, Bouaké, Yamoussoukro..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la mère
                    </label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => updateField('motherName', e.target.value)}
                      placeholder="Ex: KONE Adjoua Marie"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du père
                    </label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                      placeholder="Ex: KOUASSI Kouadio Paul"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                      placeholder="+225 07 XX XX XX XX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Livraison & Paiement</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de livraison
                  </label>
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => updateField('deliveryAddress', e.target.value)}
                    required
                    rows={3}
                    placeholder="Ex: Cocody, Angré 8ème tranche, Villa 123, près de la station Shell"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mode de paiement
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => updateField('paymentMethod', method.id)}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${
                          formData.paymentMethod === method.id
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{method.logo}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDoc && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3">Récapitulatif de votre commande</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Document: {selectedDoc.name || selectedDoc.nom}</span>
                        <span className="font-medium">{selectedDoc.price || `${selectedDoc.frais_administratifs || 2500} FCFA`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Frais de service</span>
                        <span className="font-medium">1.000 FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Frais de livraison (Abidjan)</span>
                        <span className="font-medium">2.000 FCFA</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-gray-900">Total</span>
                          <span className="text-orange-600">
                            {parseInt(selectedDoc.price?.replace(/[^\d]/g, '') || selectedDoc.frais_administratifs || '2500') + 3000} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {step === 1 ? 'Annuler' : 'Précédent'}
              </button>
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!formData.documentType || !formData.administration)) ||
                    (step === 2 && (!formData.fullName || !formData.dateOfBirth || !formData.placeOfBirth || !formData.phone))
                  }
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.deliveryAddress || !formData.paymentMethod}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Créer le mandat
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}