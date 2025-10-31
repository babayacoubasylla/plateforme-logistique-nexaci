import React, { useState, useEffect } from 'react';
import { Package, MapPin, Info, Search, Filter } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ColisData {
  _id: string;
  reference: string;
  expediteur: {
    nom: string;
    telephone: string;
  };
  destinataire: {
    nom: string;
    telephone: string;
    adresse: string;
    ville: string;
  };
  type: string;
  poids: number;
  prix: number;
  statut: 'en_attente' | 'en_cours' | 'livre' | 'annule';
  agence_depart: string;
  agence_destination?: string;
  date_creation: string;
  date_livraison?: string;
}

interface ColisPageProps {
  onBack: () => void;
}

const ColisPage: React.FC<ColisPageProps> = ({ onBack }) => {
  const [colis, setColis] = useState<ColisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchColis();
  }, []);

  const fetchColis = async () => {
    try {
      setLoading(true);
      const response = await apiService.getColis();
      if (response.status === 'success' && response.data && Array.isArray(response.data.data)) {
        setColis(response.data.data);
      } else {
        setColis([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'livre':
        return 'bg-green-100 text-green-800';
      case 'annule':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredColis = colis.filter(colis => {
    const matchesSearch = (
      colis.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.expediteur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.destinataire?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ''
    );
    const matchesStatus = selectedStatus === 'all' || colis.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-4">Chargement des colis...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          ← Retour au tableau de bord
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Colis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Suivez et gérez tous les colis de la plateforme
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un colis..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            title="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="livre">Livré</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredColis.map((colis) => (
            <li key={colis._id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-indigo-600">
                          {colis.reference}
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(colis.statut)}`}>
                          {colis.statut.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          De {colis.agence_depart} vers {colis.agence_destination || 'Non définie'}
                        </div>
                        <div className="mt-1">
                          <span className="font-medium">Expéditeur:</span> {colis.expediteur.nom}
                        </div>
                        <div>
                          <span className="font-medium">Destinataire:</span> {colis.destinataire.nom}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium text-gray-900">
                      {colis.prix.toLocaleString()} XOF
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(colis.date_creation)}
                    </div>
                    <button
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      title="Voir les détails"
                    >
                      <Info className="mr-1 h-4 w-4" />
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ColisPage;