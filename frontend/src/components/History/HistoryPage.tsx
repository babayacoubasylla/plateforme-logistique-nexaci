import React, { useState, useEffect } from 'react';
import { Package, FileText, Calendar, Search, Filter, ArrowLeft } from 'lucide-react';
import { colisService } from '../../services/colisService';
import { mandatService } from '../../services/mandatService';

interface Props {
  onBack: () => void;
  onViewDetails: (ref: string, type: 'colis' | 'mandat') => void;
}

type FilterType = 'all' | 'colis' | 'mandats';
type StatusFilter = 'all' | 'en_attente' | 'en_cours' | 'livre' | 'annule';

const HistoryPage: React.FC<Props> = ({ onBack, onViewDetails }) => {
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [colis, setColis] = useState<any[]>([]);
  const [mandats, setMandats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les colis
      const colisResponse = await colisService.getMyColis();
      setColis(colisResponse.data.colis || []);

      // Récupérer les mandats
      const mandatsResponse = await mandatService.getMyMandats();
      setMandats(mandatsResponse.data.mandats || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setError('Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_preparation':
      case 'pris_en_charge':
      case 'en_transit':
      case 'en_livraison':
      case 'documents_verifies':
      case 'procuration_signee':
      case 'depose_administration':
      case 'en_traitement':
        return 'bg-blue-100 text-blue-800';
      case 'livre':
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'annule':
      case 'refuse':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredColis = colis.filter(c => {
    const matchesSearch = c.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.destinataire?.nom?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMandats = mandats.filter(m => {
    const matchesSearch = m.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.type_document?.nom?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayItems = activeTab === 'all'
    ? [...filteredColis, ...filteredMandats].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : activeTab === 'colis'
    ? filteredColis
    : filteredMandats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Historique de mes commandes</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par référence ou destinataire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre par type */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setActiveTab('colis')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'colis'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package className="w-4 h-4" />
                Colis
              </button>
              <button
                onClick={() => setActiveTab('mandats')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'mandats'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Mandats
              </button>
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="livre">Livré</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des items */}
        {displayItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Vous n\'avez pas encore de commandes'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.map((item: any) => {
              const isColis = item.destinataire !== undefined;
              return (
                <div
                  key={item._id || item.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                  onClick={() => onViewDetails(item.reference, isColis ? 'colis' : 'mandat')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-lg ${isColis ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {isColis ? (
                          <Package className={`w-6 h-6 ${isColis ? 'text-blue-600' : 'text-purple-600'}`} />
                        ) : (
                          <FileText className="w-6 h-6 text-purple-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.reference}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.statut)}`}>
                            {item.statut.replace('_', ' ')}
                          </span>
                        </div>

                        {isColis ? (
                          <>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Destinataire:</span> {item.destinataire?.nom || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Adresse:</span> {item.destinataire?.adresse || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Poids:</span> {item.details_colis?.poids || 'N/A'} kg
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Type:</span> {item.type_document?.nom || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Administration:</span> {item.administration?.nom || 'N/A'}
                            </p>
                            {item.procuration && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Personne habilitée:</span> {item.procuration.personne_habilitee}
                              </p>
                            )}
                          </>
                        )}

                        <div className="flex items-center mt-3 text-xs text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(item.createdAt || item.date_creation)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {item.tarif?.total?.toLocaleString('fr-FR') || '0'} FCFA
                      </p>
                      <button
                        className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(item.reference, isColis ? 'colis' : 'mandat');
                        }}
                      >
                        Voir les détails →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
