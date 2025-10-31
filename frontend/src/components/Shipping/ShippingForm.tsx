import React, { useEffect, useState } from 'react';
import { Package, MapPin, User, ArrowLeft, Wallet } from 'lucide-react';
import AgenceSelector from '../Common/AgenceSelector';
import LocationPicker from '../Common/LocationPicker';
import { ShippingData } from '../../types/shipping';
import { Agence, agenceService } from '../../services/agenceService';

// (Props internes déduites des composants utilisés)

interface ShippingFormProps {
  onBack: () => void;
  onSubmit: (data: ShippingData) => void;
}

export default function ShippingForm({ onBack, onSubmit }: ShippingFormProps) {
  const [step, setStep] = useState(1);
  const [showAgenceSelector, setShowAgenceSelector] = useState(false);
  const [receiverLocation, setReceiverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [agencesLoading, setAgencesLoading] = useState(false);
  const [formData, setFormData] = useState<ShippingData>({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderLandmark: '',
    senderAgence: null,
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverLandmark: '',
    receiverAgence: null,
    packageType: '',
    packageWeight: '',
    packageDescription: '',
    paymentMethod: '',
    deliveryOption: 'home'
  });

  const updateField = (field: keyof ShippingData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Charger les agences quand l'utilisateur choisit le mode point relais
  useEffect(() => {
    const loadAgences = async () => {
      try {
        setAgencesLoading(true);
        const res = await agenceService.getAllAgences();
        setAgences(res.data.agences || []);
      } catch (e) {
        console.error('Erreur chargement agences:', e);
      } finally {
        setAgencesLoading(false);
      }
    };
    if (formData.deliveryOption === 'relay' && agences.length === 0) {
      loadAgences();
    }
  }, [formData.deliveryOption]);

  const loadNearestAgences = async () => {
    if (!navigator.geolocation) return;
    setAgencesLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await agenceService.findNearestAgences(pos.coords.latitude, pos.coords.longitude);
        setAgences(res.data.agences || []);
      } catch (e) {
        console.error('Erreur agences proches:', e);
      } finally {
        setAgencesLoading(false);
      }
    }, (err) => {
      console.warn('Geoloc error', err);
      setAgencesLoading(false);
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : vérifier que la méthode de paiement est sélectionnée
    if (!formData.paymentMethod) {
      alert('⚠️ Veuillez sélectionner une méthode de paiement');
      return;
    }
    
    console.log('✅ Formulaire validé. Méthode de paiement:', formData.paymentMethod);
    onSubmit(formData);
  };

  const packageTypes = [
    'Documents',
    'Vêtements',
    'Électronique',
    'Alimentaire',
    'Fragile',
    'Autre'
  ];

  const paymentMethods = [
    { id: 'especes', name: 'Espèces (à la livraison)', logo: '💵' },
    { id: 'orange', name: 'Orange Money', logo: '🟠', disabled: true },
    { id: 'moov', name: 'Moov Money', logo: '🔵', disabled: true },
    { id: 'wave', name: 'Wave', logo: '💙', disabled: true },
    { id: 'momo', name: 'MTN Momo', logo: '🟡', disabled: true }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Envoi de Colis</h1>
          <p className="text-gray-600">Remplissez les informations pour votre envoi</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= num ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                } font-semibold transition-colors`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > num ? 'bg-emerald-600' : 'bg-gray-300'
                  } transition-colors`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Expéditeur</span>
            <span className="text-xs text-gray-600">Destinataire</span>
            <span className="text-xs text-gray-600">Colis</span>
            <span className="text-xs text-gray-600">Paiement</span>
          </div>
        </div>

        {showAgenceSelector && (
          <AgenceSelector
            userLocation={receiverLocation}
            onSelect={(agence) => {
              setShowAgenceSelector(false);
              updateField('receiverAgence', agence);
            }}
            onClose={() => setShowAgenceSelector(false)}
          />
        )}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informations de l'expéditeur</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => updateField('senderPhone', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+225 07 XX XX XX XX"
                  />
                  <p className="mt-1 text-xs text-gray-500">Format recommandé: +225XXXXXXXXXX</p>
                </div>

                <div>
                  <LocationPicker
                    label="Adresse"
                    placeholder="Commune, quartier"
                    defaultValue={formData.senderAddress}
                    onLocationSelect={(address) => updateField('senderAddress', address)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Point de repère
                  </label>
                  <input
                    type="text"
                    value={formData.senderLandmark}
                    onChange={(e) => updateField('senderLandmark', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ex: Près de la pharmacie centrale"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informations du destinataire</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => updateField('receiverName', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Nom du destinataire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.receiverPhone}
                    onChange={(e) => updateField('receiverPhone', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+225 07 XX XX XX XX"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ce numéro recevra les notifications WhatsApp. Format: +225XXXXXXXXXX</p>
                </div>

                <div>
                  <LocationPicker
                    label="Adresse de livraison"
                    placeholder="Commune, quartier"
                    defaultValue={formData.receiverAddress}
                    onLocationSelect={(address, coordinates) => {
                      updateField('receiverAddress', address);
                      if (coordinates) {
                        setReceiverLocation(coordinates);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Point de repère
                  </label>
                  <input
                    type="text"
                    value={formData.receiverLandmark}
                    onChange={(e) => updateField('receiverLandmark', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ex: En face du marché"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de livraison
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        updateField('deliveryOption', 'home');
                        updateField('receiverAgence', null);
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.deliveryOption === 'home'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🏠</div>
                        <div className="font-semibold text-gray-900">À domicile</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('deliveryOption', 'relay');
                        setShowAgenceSelector(true);
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.deliveryOption === 'relay'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📦</div>
                        <div className="font-semibold text-gray-900">Point relais</div>
                      </div>
                    </button>
                  </div>
                  {formData.deliveryOption === 'relay' && (
                    <div className="mt-4">
                      <label htmlFor="relayAgenceSelect" className="block text-sm font-medium text-gray-700 mb-2">Choisir un point relais</label>
                      <div className="flex gap-2 items-center mb-3">
                        <button
                          type="button"
                          onClick={() => setShowAgenceSelector(true)}
                          className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Ouvrir la carte / liste
                        </button>
                        <button
                          type="button"
                          onClick={loadNearestAgences}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          <MapPin className="w-4 h-4" /> Près de moi
                        </button>
                      </div>
                      <select
                        id="relayAgenceSelect"
                        value={formData.receiverAgence?._id || formData.receiverAgence?.id || ''}
                        onChange={(e) => {
                          const selected = agences.find(a => (a._id || a.id) === e.target.value);
                          if (selected) updateField('receiverAgence', selected);
                        }}
                        disabled={agencesLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez un point relais</option>
                        {agences.map((a) => (
                          <option key={a._id || a.id} value={a._id || a.id}>
                            {a.ville} — {a.nom}
                          </option>
                        ))}
                      </select>
                      {formData.receiverAgence && (
                        <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <h4 className="font-medium text-emerald-800 mb-1">Point relais sélectionné :</h4>
                          <p className="text-emerald-700">{formData.receiverAgence.nom}</p>
                          <p className="text-sm text-emerald-600">{formData.receiverAgence.adresse}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {formData.deliveryOption === 'relay' && formData.receiverAgence && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <h4 className="font-medium text-emerald-800 mb-2">Point relais sélectionné :</h4>
                      <p className="text-emerald-700">{formData.receiverAgence.nom}</p>
                      <p className="text-sm text-emerald-600">{formData.receiverAgence.adresse}</p>
                      <button
                        type="button"
                        onClick={() => setShowAgenceSelector(true)}
                        className="mt-2 text-sm text-emerald-700 hover:text-emerald-800 underline"
                      >
                        Changer de point relais
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Détails du colis</h2>
                </div>

                <div>
                  <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de colis
                  </label>
                  <select
                    id="packageType"
                    value={formData.packageType}
                    onChange={(e) => updateField('packageType', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un type</option>
                    {packageTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="packageWeight" className="block text-sm font-medium text-gray-700 mb-2">
                    Poids approximatif
                  </label>
                  <select
                    id="packageWeight"
                    value={formData.packageWeight}
                    onChange={(e) => updateField('packageWeight', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez le poids</option>
                    <option value="0-1kg">0 - 1 kg</option>
                    <option value="1-5kg">1 - 5 kg</option>
                    <option value="5-10kg">5 - 10 kg</option>
                    <option value="10-20kg">10 - 20 kg</option>
                    <option value="20kg+">Plus de 20 kg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du contenu
                  </label>
                  <textarea
                    value={formData.packageDescription}
                    onChange={(e) => updateField('packageDescription', e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Décrivez le contenu de votre colis..."
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Mode de paiement</h2>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Frais d'envoi estimés</span>
                    <span className="text-2xl font-bold text-emerald-600">2.500 FCFA</span>
                  </div>
                  <p className="text-sm text-gray-600">Le prix final sera confirmé après validation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choisissez votre méthode de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => !method.disabled && updateField('paymentMethod', method.id)}
                        disabled={method.disabled}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-emerald-600 bg-emerald-50'
                            : method.disabled
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{method.logo}</div>
                          <div className="font-semibold text-gray-900">{method.name}</div>
                          {method.disabled && (
                            <div className="text-xs text-gray-500 mt-1">(Bientôt disponible)</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Récapitulatif</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">De:</span> {formData.senderName}</p>
                    <p><span className="text-gray-600">À:</span> {formData.receiverName}</p>
                    <p><span className="text-gray-600">Type:</span> {formData.packageType}</p>
                    <p><span className="text-gray-600">Poids:</span> {formData.packageWeight}</p>
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
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Confirmer l'envoi
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
