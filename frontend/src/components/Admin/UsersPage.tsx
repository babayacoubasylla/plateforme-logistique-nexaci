import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Search, Plus } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface AgenceData {
  _id: string;
  nom: string;
  ville: string;
  adresse: string;
}

interface UserData {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone: string;
  agence_id?: string;
  agence?: AgenceData;
  profile?: {
    agence_id?: string;
  };
  status: 'active' | 'inactive';
}

interface UsersPageProps {
  onBack: () => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [agences, setAgences] = useState<AgenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersResponse, agencesResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getAgences()
      ]);

      if (usersResponse.status === 'success' && usersResponse.data) {
        setUsers(usersResponse.data.users || []);
      } else {
        throw new Error(usersResponse.message || 'Erreur lors du chargement des utilisateurs');
      }

      if (agencesResponse.status === 'success' && agencesResponse.data) {
        setAgences(agencesResponse.data.agences || []);
      } else {
        throw new Error(agencesResponse.message || 'Erreur lors du chargement des agences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData: Omit<UserData, '_id'>) => {
    try {
      const response = await apiService.createUser(userData);
      if (response.status === 'success') {
        await fetchInitialData();
        setShowAddModal(false);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'ajout de l\'utilisateur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  const handleEditUser = async (userId: string, userData: Partial<UserData>) => {
    try {
      const response = await apiService.updateUser(userId, userData);
      if (response.status === 'success') {
        await fetchInitialData();
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.message || 'Erreur lors de la modification de l\'utilisateur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await apiService.deleteUser(userId);
      if (response.status === 'success') {
        await fetchInitialData();
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-4">Chargement des utilisateurs...</div>;
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez les comptes utilisateurs de la plateforme
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            title="Filtrer par rôle"
            aria-label="Filtrer par rôle"
          >
            <option value="all">Tous les rôles</option>
            <option value="client">Client</option>
            <option value="livreur">Livreur</option>
            <option value="gerant">Gérant</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user._id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600">
                        {user.prenom} {user.nom}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {user.role}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier l'utilisateur"
                      aria-label={`Modifier l'utilisateur ${user.prenom} ${user.nom}`}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer l'utilisateur"
                      aria-label={`Supprimer l'utilisateur ${user.prenom} ${user.nom}`}
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
              <h3 className="text-lg font-medium text-gray-900">Ajouter un nouvel utilisateur</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newUser = {
                  nom: formData.get('nom') as string,
                  prenom: formData.get('prenom') as string,
                  email: formData.get('email') as string,
                  telephone: formData.get('telephone') as string,
                  role: formData.get('role') as string,
                  status: 'active' as const
                };
                handleAddUser(newUser);
              }} className="mt-4 space-y-4">
                <input type="text" name="nom" placeholder="Nom" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="text" name="prenom" placeholder="Prénom" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="email" name="email" placeholder="Email" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="tel" name="telephone" placeholder="Téléphone" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <select name="role" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  title="Rôle de l'utilisateur" aria-label="Rôle de l'utilisateur">
                  <option value="">Sélectionner un rôle</option>
                  <option value="client">Client</option>
                  <option value="livreur">Livreur</option>
                  <option value="gerant">Gérant</option>
                  <option value="admin">Admin</option>
                </select>
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

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900">Modifier l'utilisateur</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedUser = {
                  nom: formData.get('nom') as string,
                  prenom: formData.get('prenom') as string,
                  email: formData.get('email') as string,
                  telephone: formData.get('telephone') as string,
                  role: formData.get('role') as string,
                  profile: {
                    ...(selectedUser.profile || {}),
                    agence_id: formData.get('agence_id') as string || undefined
                  }
                };
                handleEditUser(selectedUser._id, updatedUser);
              }} className="mt-4 space-y-4">
                <input type="text" name="nom" defaultValue={selectedUser.nom} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="text" name="prenom" defaultValue={selectedUser.prenom} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="email" name="email" defaultValue={selectedUser.email} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <input type="tel" name="telephone" defaultValue={selectedUser.telephone} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <select name="role" defaultValue={selectedUser.role} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  title="Rôle de l'utilisateur" aria-label="Rôle de l'utilisateur">
                  <option value="client">Client</option>
                  <option value="livreur">Livreur</option>
                  <option value="gerant">Gérant</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Champ de sélection d'agence uniquement pour les gérants */}
                {selectedUser.role === 'gerant' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Agence assignée
                    </label>
                    <select
                      name="agence_id"
                      defaultValue={selectedUser.profile?.agence_id || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      title="Agence assignée"
                    >
                      <option value="">Sélectionner une agence</option>
                      {agences.map((agence) => (
                        <option key={agence._id} value={agence._id}>
                          {agence.nom} - {agence.ville}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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

export default UsersPage;