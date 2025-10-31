import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Edit, Trash2, Search, Plus, Phone } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface AgenceData {
  _id: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  gerant?: string;
  statut: 'active' | 'inactive' | 'maintenance';
}

interface AgencesPageProps {
  onBack: () => void;
}

const AgencesPage: React.FC<AgencesPageProps> = ({ onBack }) => {
  const [agences, setAgences] = useState<AgenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgence, setSelectedAgence] = useState<AgenceData | null>(null);
  const [gerants, setGerants] = useState<Array<{ _id: string, nom: string, prenom: string }>>([]);

  useEffect(() => {
    fetchAgences();
    fetchGerants();
  }, []);

  const fetchGerants = async () => {
    try {
      const response = await apiService.getUsers('gerant');
      if (response.status === 'success' && response.data) {
        console.log('Gérants récupérés:', response.data.users);
        setGerants(response.data.users);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des gérants:', err);
      setError('Erreur lors de la récupération des gérants');
    }
  };

  const fetchAgences = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAgences();
      if (response.status === 'success' && response.data) {
        setAgences(response.data.agences || []);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des agences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgence = async (agenceData: Omit<AgenceData, '_id'>) => {
    try {
      const response = await apiService.createAgence(agenceData);
      if (response.status === 'success') {
        await fetchAgences();
        setShowAddModal(false);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'ajout de l\'agence');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'agence');
    }
  };

  const handleEditAgence = async (agenceId: string, agenceData: Partial<AgenceData>) => {
    try {
      const response = await apiService.updateAgence(agenceId, agenceData);
      if (response.status === 'success') {
        await fetchAgences();
        setShowEditModal(false);
        setSelectedAgence(null);
      } else {
        throw new Error(response.message || 'Erreur lors de la modification de l\'agence');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de l\'agence');
    }
  };

  const handleDeleteAgence = async (agenceId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
      return;
    }

    try {
      const response = await apiService.deleteAgence(agenceId);
      if (response.status === 'success') {
        await fetchAgences();
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'agence');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'agence');
    }
  };

  const filteredAgences = agences.filter(agence =>
    agence.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agence.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agence.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-4">Chargement des agences...</div>;
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
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Agences</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez les agences de la plateforme logistique
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Agence
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une agence..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredAgences.map((agence) => (
            <li key={agence._id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600">
                        {agence.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {agence.adresse}, {agence.ville}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4" />
                          {agence.telephone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      agence.statut === 'active' ? 'bg-green-100 text-green-800' : 
                      agence.statut === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {agence.statut === 'active' ? 'Active' : 
                       agence.statut === 'maintenance' ? 'En maintenance' : 
                       'Inactive'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedAgence(agence);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier l'agence"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAgence(agence._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer l'agence"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900">Ajouter une nouvelle agence</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                const formData = new FormData(e.currentTarget);
                const agenceName = formData.get('nom') as string;
                const gerantId = formData.get('gerant');

                if (!gerantId) {
                  setError('Veuillez sélectionner un gérant');
                  return;
                }

                // Générer un code unique basé sur le nom de l'agence
                const code = agenceName
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
                  .substring(0, 6) + Math.floor(Math.random() * 1000)
                  .toString()
                  .padStart(3, '0');

                const newAgence = {
                  nom: agenceName,
                  code: code,
                  adresse: formData.get('adresse') as string,
                  ville: formData.get('ville') as string,
                  telephone: formData.get('telephone') as string,
                  email: formData.get('email') as string,
                  statut: 'active' as const,
                  gerant: gerantId,
                  capacite_stock: parseInt(formData.get('capacite_stock') as string) || 100,
                  localisation: {
                    type: 'Point',
                    coordinates: [0, 0] // Coordonnées par défaut, à remplacer par les vraies coordonnées
                  }
                };

                try {
                  await handleAddAgence(newAgence);
                  setShowAddModal(false);
                } catch (error) {
                  if (error instanceof Error) {
                    setError(error.message);
                  } else {
                    setError('Une erreur est survenue lors de la création de l\'agence');
                  }
                }
              }} className="mt-4 space-y-4">
                <input type="text" name="nom" placeholder="Nom de l'agence" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="text" name="adresse" placeholder="Adresse" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="text" name="ville" placeholder="Ville" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="tel" name="telephone" placeholder="Téléphone" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="email" name="email" placeholder="Email" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="number" name="capacite_stock" placeholder="Capacité de stockage" defaultValue={100}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <select 
                  name="gerant" 
                  required
                  aria-label="Sélectionner un gérant"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner un gérant</option>
                  {gerants.map(gerant => (
                    <option key={gerant._id} value={gerant._id}>
                      {gerant.nom} {gerant.prenom}
                    </option>
                  ))}
                </select>
                {error && (
                  <div className="text-red-600 text-sm my-2">
                    {error}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Annuler
                  </button>
                  <button type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedAgence && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900">Modifier l'agence</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedAgence = {
                  nom: formData.get('nom') as string,
                  adresse: formData.get('adresse') as string,
                  ville: formData.get('ville') as string,
                  telephone: formData.get('telephone') as string,
                  email: formData.get('email') as string,
                  statut: formData.get('statut') as 'active' | 'inactive' | 'maintenance'
                };
                handleEditAgence(selectedAgence._id, updatedAgence);
              }} className="mt-4 space-y-4">
                <input type="text" name="nom" defaultValue={selectedAgence.nom} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="text" name="adresse" defaultValue={selectedAgence.adresse} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="text" name="ville" defaultValue={selectedAgence.ville} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="tel" name="telephone" defaultValue={selectedAgence.telephone} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="email" name="email" defaultValue={selectedAgence.email} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <select 
                  name="statut" 
                  defaultValue={selectedAgence.statut}
                  aria-label="Statut de l'agence"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">En maintenance</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => {
                    setShowEditModal(false);
                    setSelectedAgence(null);
                  }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Annuler
                  </button>
                  <button type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencesPage;