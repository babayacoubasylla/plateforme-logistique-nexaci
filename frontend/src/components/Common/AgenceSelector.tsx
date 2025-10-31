import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { agenceService, Agence } from '../../services/agenceService';

interface AgenceSelectorProps {
  onSelect: (agence: Agence) => void;
  onClose?: () => void;
  defaultCity?: string;
  userLocation?: { latitude: number; longitude: number } | null;
  className?: string;
}

const AgenceSelector: React.FC<AgenceSelectorProps> = ({
  onSelect,
  onClose,
  defaultCity,
  userLocation,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(defaultCity || '');
  const [cities, setCities] = useState<string[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null);

  // Charger toutes les agences au démarrage
  useEffect(() => {
    const loadAgences = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await agenceService.getAllAgences();
        setAgences(response.data.agences);
        // Extraire les villes uniques
        const uniqueCities = [...new Set(response.data.agences.map(a => a.ville))];
        setCities(uniqueCities.sort());
      } catch (err) {
        setError("Erreur lors du chargement des agences");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAgences();
  }, []);

  // Charger les agences proches si une localisation est fournie
  useEffect(() => {
    if (userLocation) {
      handleUseProvidedLocation(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  // Gérer la sélection d'une ville
  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setSelectedAgence(null);
    
    try {
      setLoading(true);
      setError(null);
      const response = await agenceService.searchAgencesByCity(city);
      setAgences(response.data.agences);
    } catch (err) {
      setError("Erreur lors de la recherche des agences");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection d'une agence
  const handleAgenceSelect = (agence: Agence) => {
    setSelectedAgence(agence);
    onSelect(agence);
  };

  // Utiliser une localisation fournie
  const handleUseProvidedLocation = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const response = await agenceService.findNearestAgences(latitude, longitude);
      setAgences(response.data.agences);
      if (response.data.agences.length > 0) {
        setSelectedCity(response.data.agences[0].ville);
      }
    } catch (err) {
      setError("Erreur lors de la recherche des agences proches");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Utiliser la géolocalisation
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await handleUseProvidedLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError("Erreur de géolocalisation: " + error.message);
          setLoading(false);
        }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Choisir un point relais</h2>
          {onClose && (
            <button
              onClick={onClose}
              title="Fermer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="p-6 space-y-4">
      {/* Bouton de géolocalisation */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={loading}
        className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Recherche en cours...</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            <span>Trouver les points relais près de moi</span>
          </>
        )}
      </button>

      {/* Sélection de la ville */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          Ville
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Sélectionnez une ville</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des agences */}
      {selectedCity && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Agence
          </label>
          <div className="mt-1 space-y-2">
            {agences
              .filter((a) => a.ville === selectedCity)
              .map((agence, index) => (
                <div
                  key={agence.id || agence.code || (agence as any)._id || `${agence.ville}-${index}`}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedAgence?.id === agence.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => handleAgenceSelect(agence)}
                >
                  <h3 className="font-medium text-gray-900">{agence.nom}</h3>
                  <p className="text-sm text-gray-500">{agence.adresse}</p>
                  <p className="text-sm text-gray-500">{agence.telephone}</p>
                  {agence.horaires && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ouvert: {agence.horaires.lundi?.ouverture} - {agence.horaires.lundi?.fermeture}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AgenceSelector;