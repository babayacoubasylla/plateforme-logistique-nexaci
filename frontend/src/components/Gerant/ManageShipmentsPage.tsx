import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, TrendingUp, Clock, CheckCircle, Truck, Flag, XCircle, Download, MoreVertical } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { colisService } from '../../services/colisService';

interface ShipmentData {
  _id: string;
  reference: string;
  expediteur: {
    nom: string;
    prenom?: string;
    telephone: string;
  };
  destinataire?: {
    nom: string;
    telephone: string;
    adresse: string;
    ville: string;
  };
  livreur?: {
    _id: string;
    nom: string;
    prenom?: string;
    telephone?: string;
  };
  pointRelais?: {
    _id: string;
    nom: string;
    adresse: string;
    ville: string;
  };
  typeLivraison: 'domicile' | 'point_relais';
  details_colis: {
    poids: number;
    description?: string;
  };
  tarif: {
    total: number;
  };
  statut: 'en_attente' | 'en_preparation' | 'pris_en_charge' | 'en_transit' | 'en_livraison' | 'livre' | 'annule' | 'echec_livraison';
  createdAt: string;
  updatedAt?: string;
}

interface ManageShipmentsPageProps {
  onBack: () => void;
  agenceId: string;
  onManageShipment?: (shipment: ShipmentData) => void;
}

const ManageShipmentsPage: React.FC<ManageShipmentsPageProps> = ({ onBack, agenceId, onManageShipment }) => {
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    enCours: 0,
    livres: 0,
    annules: 0,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // Fermer le menu d'actions au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Si on clique ni sur le déclencheur, ni dans le menu => fermer
      if (!target.closest('.actions-trigger') && !target.closest('.actions-menu')) {
        if (menuOpenFor) setMenuOpenFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenFor]);

  useEffect(() => {
    fetchShipments();
  }, [agenceId]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      console.log('📦 [ManageShipmentsPage] Récupération des colis pour agence:', agenceId);
      const response = await apiService.getColisByAgence(agenceId);
      
      if (response.status === 'success' && response.data) {
        const shipmentsData = response.data.colis || [];
        console.log('✅ [ManageShipmentsPage] Colis reçus:', shipmentsData.length);
        setShipments(shipmentsData);
        
        // Calculer les statistiques
        const stats = {
          total: shipmentsData.length,
          enAttente: shipmentsData.filter((s: any) => s.statut === 'en_attente').length,
          enCours: shipmentsData.filter((s: any) => ['en_preparation', 'pris_en_charge', 'en_transit', 'en_livraison'].includes(s.statut)).length,
          livres: shipmentsData.filter((s: any) => s.statut === 'livre').length,
          annules: shipmentsData.filter((s: any) => s.statut === 'annule').length,
        };
        setStats(stats);
      }
    } catch (err) {
      console.error('❌ [ManageShipmentsPage] Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const recomputeStats = (list: ShipmentData[]) => {
    const s = {
      total: list.length,
      enAttente: list.filter((x) => x.statut === 'en_attente').length,
      enCours: list.filter((x) => ['en_preparation','pris_en_charge','en_transit','en_livraison'].includes(x.statut)).length,
      livres: list.filter((x) => x.statut === 'livre').length,
      annules: list.filter((x) => x.statut === 'annule').length,
    };
    setStats(s);
  };

  const handleUpdateStatus = async (shipment: ShipmentData, newStatus: ShipmentData['statut']) => {
    try {
      setUpdatingId(shipment._id);
      await apiService.updateColisStatus(shipment._id, newStatus);
      // Mettre à jour localement
      const updated = shipments.map((s) => s._id === shipment._id ? { ...s, statut: newStatus } : s);
      setShipments(updated);
      recomputeStats(updated);
    } catch (e: any) {
      console.error('❌ [ManageShipmentsPage] Erreur maj statut:', e);
      alert(e?.response?.data?.message || e.message || 'Impossible de mettre à jour le statut');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadReceipt = async (shipment: ShipmentData) => {
    try {
      setDownloadingRef(shipment.reference);
      const blob = await colisService.downloadReceiptByReference(shipment.reference);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-colis-${shipment.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('❌ [ManageShipmentsPage] Erreur téléchargement reçu:', e);
      alert(e?.response?.data?.message || e.message || 'Impossible de télécharger le reçu');
    } finally {
      setDownloadingRef(null);
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

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = (
      shipment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.expediteur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destinataire?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ''
    );
    const matchesStatus = selectedStatus === 'all' || shipment.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Colis</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez tous les colis de votre agence
            </p>
          </div>
          <button
            onClick={() => {/* Implémenter la création de colis */}}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Colis
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-indigo-600" />
            <span className="ml-2 text-sm font-medium text-gray-500">Total</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-600" />
            <span className="ml-2 text-sm font-medium text-gray-500">En attente</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.enAttente}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-sm font-medium text-gray-500">En cours</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.enCours}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-green-600" />
            <span className="ml-2 text-sm font-medium text-gray-500">Livrés</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.livres}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-red-600" />
            <span className="ml-2 text-sm font-medium text-gray-500">Annulés</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.annules}</div>
        </div>
      </div>

      {/* Filtres et recherche */}
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

      {/* Liste des colis */}
      {loading ? (
        <div className="text-center py-8">Chargement des colis...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : filteredShipments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun colis trouvé
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredShipments.map((shipment) => (
              <li key={shipment._id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-6 w-6 text-gray-400" />
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-indigo-600">
                            {shipment.reference}
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.statut)}`}>
                            {shipment.statut.replace('_', ' ')}
                          </span>
                          {shipment.livreur && (
                            <span
                              className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                              title={`Téléphone: ${shipment.livreur.telephone || 'N/A'}`}
                            >
                              Livreur : {shipment.livreur.prenom ? `${shipment.livreur.prenom} ` : ''}{shipment.livreur.nom}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="mt-1">
                            <span className="font-medium">Expéditeur:</span> {shipment.expediteur.nom} {shipment.expediteur.prenom}
                          </div>
                          <div>
                            <span className="font-medium">
                              {shipment.typeLivraison === 'point_relais' ? 'Point relais:' : 'Destinataire:'}
                            </span>{' '}
                            {shipment.typeLivraison === 'point_relais' 
                              ? shipment.pointRelais?.nom || 'N/A'
                              : shipment.destinataire?.nom || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium text-gray-900">
                        {shipment.tarif.total.toLocaleString()} XOF
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(shipment.createdAt)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 justify-end relative">
                        {shipment.statut === 'en_attente' && (
                          <>
                            <button
                              disabled={updatingId === shipment._id}
                              className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              title="Marquer comme pris en charge"
                              onClick={() => handleUpdateStatus(shipment, 'pris_en_charge')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Pris en charge
                            </button>
                            <button
                              disabled={updatingId === shipment._id}
                              className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                              title="Annuler le colis"
                              onClick={() => handleUpdateStatus(shipment, 'annule')}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Annuler
                            </button>
                          </>
                        )}

                        {['en_preparation','pris_en_charge'].includes(shipment.statut) && (
                          <button
                            disabled={updatingId === shipment._id}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            title="Démarrer la livraison"
                            onClick={() => handleUpdateStatus(shipment, 'en_livraison')}
                          >
                            <Truck className="h-4 w-4 mr-1" /> En livraison
                          </button>
                        )}

                        {shipment.statut === 'en_livraison' && (
                          <>
                            <button
                              disabled={updatingId === shipment._id}
                              className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                              title="Marquer comme livré"
                              onClick={() => handleUpdateStatus(shipment, 'livre')}
                            >
                              <Flag className="h-4 w-4 mr-1" /> Livré
                            </button>
                            <button
                              disabled={updatingId === shipment._id}
                              className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              title="Marquer échec de livraison"
                              onClick={() => handleUpdateStatus(shipment, 'echec_livraison')}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Échec
                            </button>
                          </>
                        )}

                        {/* Menu Actions compact */}
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 actions-trigger"
                            onClick={() => setMenuOpenFor(menuOpenFor === shipment._id ? null : shipment._id)}
                            title="Actions"
                          >
                            <MoreVertical className="h-4 w-4 mr-1" /> Actions
                          </button>
                          {menuOpenFor === shipment._id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 actions-menu">
                              <div className="py-1">
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(shipment.reference);
                                      setMenuOpenFor(null);
                                      // Optionnel: toast; on reste simple avec alert
                                      alert(`Référence copiée: ${shipment.reference}`);
                                    } catch (err) {
                                      console.error('Clipboard error', err);
                                      // Fallback
                                      const ta = document.createElement('textarea');
                                      ta.value = shipment.reference;
                                      document.body.appendChild(ta);
                                      ta.select();
                                      document.execCommand('copy');
                                      document.body.removeChild(ta);
                                      setMenuOpenFor(null);
                                      alert(`Référence copiée: ${shipment.reference}`);
                                    }
                                  }}
                                >
                                  Copier la référence
                                </button>
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 inline-flex items-center"
                                  onClick={() => { setMenuOpenFor(null); handleDownloadReceipt(shipment); }}
                                  disabled={downloadingRef === shipment.reference}
                                >
                                  <Download className="h-4 w-4 mr-2" /> Télécharger le reçu
                                </button>
                                {onManageShipment && (
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => { setMenuOpenFor(null); onManageShipment(shipment); }}
                                  >
                                    Assigner un coursier
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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

export default ManageShipmentsPage;