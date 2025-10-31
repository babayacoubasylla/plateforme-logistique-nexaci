import React, { useState, useEffect } from 'react';
import { UserCircle, Search, Filter, Check } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface Courier {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  status: 'active' | 'inactive';
  charges: number; // Nombre de mandats/colis actuellement assignés
}

interface AssignCouriersPageProps {
  onBack: () => void;
  agenceId: string;
  colisId?: string;
  mandatId?: string;
}

const AssignCouriersPage: React.FC<AssignCouriersPageProps> = ({ onBack, agenceId, colisId, mandatId }) => {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchCouriers();
  }, [agenceId]);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCoursiers(agenceId);
      if (response.status === 'success' && response.data) {
        setCouriers(response.data);
      } else {
        setError('Erreur lors du chargement des coursiers');
      }
    } catch (err) {
      setError('Erreur lors du chargement des coursiers');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChargesColor = (charges: number) => {
    if (charges < 5) return 'text-green-600 bg-green-100';
    if (charges < 10) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = 
      courier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.telephone.includes(searchTerm);
    
    if (selectedStatus === 'all') return matchesSearch;
    return matchesSearch && courier.status === selectedStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Gestion des Coursiers</h1>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un coursier..."
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
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Liste des coursiers */}
      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-600">{error}</div>
      ) : filteredCouriers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">Aucun coursier trouvé</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredCouriers.map((courier) => (
              <li key={courier._id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserCircle className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="font-medium text-gray-900">
                            {courier.prenom} {courier.nom}
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            courier.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {courier.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <div>{courier.email}</div>
                          <div>{courier.telephone}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getChargesColor(courier.charges)}`}>
                        {courier.charges} assignation{courier.charges > 1 ? 's' : ''}
                      </div>
                      <button
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={async () => {
                          try {
                            if (!colisId && !mandatId) {
                              alert('Aucun élément à assigner. Revenez à la liste et choisissez un colis ou mandat.');
                              return;
                            }
                            const resp = await apiService.assignCourier(agenceId, courier._id, colisId, mandatId);
                            console.log('✅ Assignation réussie:', resp);
                            alert('Coursier assigné avec succès.');
                          } catch (e) {
                            console.error('❌ Erreur assignation:', e);
                            alert('Impossible d\'assigner le coursier.');
                          }
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Assigner
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignCouriersPage;