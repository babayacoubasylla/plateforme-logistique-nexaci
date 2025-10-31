// frontend/src/components/Admin/AdminHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Package, FileText, Download, Search, Filter, Clock, Building2, User } from 'lucide-react';
import api from '../../services/api';

interface Colis {
  _id: string;
  reference: string;
  statut: string;
  expediteur?: { nom: string; prenom: string; telephone: string };
  destinataire?: { nom: string; telephone: string; ville: string };
  pointRelais?: { _id?: string; nom: string; ville: string };
  livreur?: { _id?: string; nom: string; prenom: string; telephone: string };
  tarif: { total: number };
  createdAt: string;
  updatedAt: string;
}

interface Mandat {
  _id: string;
  reference: string;
  statut: string;
  type_document: { nom: string };
  administration: { nom: string; ville: string };
  client: { nom: string; prenom: string; telephone: string };
  coursier_assigné?: { _id?: string; nom: string; prenom: string };
  tarif: { total: number };
  createdAt: string;
  updatedAt: string;
}

interface Agence {
  _id: string;
  nom: string;
  ville: string;
}

interface Livreur {
  _id: string;
  nom: string;
  prenom: string;
}

interface Props {
  onBack: () => void;
}

const AdminHistoryPage: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'colis' | 'mandats'>('colis');
  const [colis, setColis] = useState<Colis[]>([]);
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [agenceFilter, setAgenceFilter] = useState<string>('');
  const [livreurFilter, setLivreurFilter] = useState<string>('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    fetchAgences();
    fetchLivreurs();
  }, []);

  useEffect(() => {
    if (activeTab === 'colis') {
      fetchColisHistory();
    } else {
      fetchMandatsHistory();
    }
  }, [activeTab, statutFilter, agenceFilter, livreurFilter, dateDebut, dateFin]);

  const fetchAgences = async () => {
    try {
      const res = await api.get('/api/agences');
      setAgences(res.data?.data?.agences || []);
    } catch (error) {
      console.error('❌ Erreur fetch agences:', error);
    }
  };

  const fetchLivreurs = async () => {
    try {
      const res = await api.get('/api/users?role=livreur');
      setLivreurs(res.data?.data?.users || []);
    } catch (error) {
      console.error('❌ Erreur fetch livreurs:', error);
    }
  };

  const fetchColisHistory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statutFilter) params.statut = statutFilter;
      if (agenceFilter) params.agence = agenceFilter;
      if (livreurFilter) params.livreur = livreurFilter;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;

      const res = await api.get('/api/colis/history/all', { params });
      const data = res.data?.data?.colis || res.data?.colis || [];
      setColis(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur fetch historique colis:', error);
      setColis([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMandatsHistory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statutFilter) params.statut = statutFilter;
      if (livreurFilter) params.livreur = livreurFilter;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;

      const res = await api.get('/api/mandats/history/all', { params });
      const data = res.data?.data?.mandats || res.data?.mandats || [];
      setMandats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur fetch historique mandats:', error);
      setMandats([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (reference: string, type: 'colis' | 'mandat') => {
    try {
      const endpoint = type === 'colis' 
        ? `/api/colis/receipt/ref/${reference}` 
        : `/api/mandats/receipt/ref/${reference}`;
      
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reçu-${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('❌ Téléchargement reçu:', error);
      alert('Erreur lors du téléchargement du reçu');
    }
  };

  const exportToCSV = () => {
    const data = activeTab === 'colis' ? filteredColis : filteredMandats;
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    let csv = '';
    if (activeTab === 'colis') {
      csv = 'Référence,Statut,Expéditeur,Destinataire,Agence,Livreur,Montant,Date\n';
      (data as Colis[]).forEach((c) => {
        const exp = c.expediteur ? `${c.expediteur.prenom} ${c.expediteur.nom}` : 'N/A';
        const dest = c.destinataire?.nom || c.pointRelais?.nom || 'N/A';
        const agence = c.pointRelais?.nom || 'N/A';
        const livreur = c.livreur ? `${c.livreur.prenom} ${c.livreur.nom}` : 'Non assigné';
        csv += `${c.reference},${c.statut},${exp},${dest},${agence},${livreur},${c.tarif.total},${new Date(c.updatedAt).toLocaleDateString()}\n`;
      });
    } else {
      csv = 'Référence,Statut,Client,Document,Administration,Livreur,Montant,Date\n';
      (data as Mandat[]).forEach((m) => {
        const client = m.client ? `${m.client.prenom} ${m.client.nom}` : 'N/A';
        const livreur = m.coursier_assigné ? `${m.coursier_assigné.prenom} ${m.coursier_assigné.nom}` : 'Non assigné';
        csv += `${m.reference},${m.statut},${client},${m.type_document.nom},${m.administration.nom},${livreur},${m.tarif.total},${new Date(m.updatedAt).toLocaleDateString()}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historique-global-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'livre': return 'bg-green-100 text-green-800';
      case 'echec_livraison':
      case 'echec': return 'bg-red-100 text-red-800';
      case 'annule': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      livre: 'Livré',
      echec_livraison: 'Échec',
      echec: 'Échec',
      annule: 'Annulé'
    };
    return labels[statut] || statut;
  };

  const filteredColis = colis.filter((c) =>
    c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.expediteur && `${c.expediteur.prenom} ${c.expediteur.nom}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.destinataire?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.livreur && `${c.livreur.prenom} ${c.livreur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMandats = mandats.filter((m) =>
    m.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.client && `${m.client.prenom} ${m.client.nom}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    m.type_document.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Retour au tableau de bord
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Historique Global</h1>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('colis')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'colis'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="inline mr-2" size={20} />
            Colis ({filteredColis.length})
          </button>
          <button
            onClick={() => setActiveTab('mandats')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'mandats'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="inline mr-2" size={20} />
            Mandats ({filteredMandats.length})
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-800">Filtres</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Statut */}
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="livre">Livré</option>
              <option value={activeTab === 'colis' ? 'echec_livraison' : 'echec'}>Échec</option>
              <option value="annule">Annulé</option>
            </select>

            {/* Agence (colis seulement) */}
            {activeTab === 'colis' && (
              <select
                value={agenceFilter}
                onChange={(e) => setAgenceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par agence"
              >
                <option value="">Toutes les agences</option>
                {agences.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.nom} - {a.ville}
                  </option>
                ))}
              </select>
            )}

            {/* Livreur */}
            <select
              value={livreurFilter}
              onChange={(e) => setLivreurFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrer par livreur"
            >
              <option value="">Tous les livreurs</option>
              {livreurs.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.prenom} {l.nom}
                </option>
              ))}
            </select>

            {/* Date début */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Date début"
              />
            </div>

            {/* Date fin */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Date fin"
              />
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-800">
              {activeTab === 'colis' ? filteredColis.length : filteredMandats.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Livrés</div>
            <div className="text-2xl font-bold text-green-600">
              {activeTab === 'colis'
                ? filteredColis.filter((c) => c.statut === 'livre').length
                : filteredMandats.filter((m) => m.statut === 'livre').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Échecs</div>
            <div className="text-2xl font-bold text-red-600">
              {activeTab === 'colis'
                ? filteredColis.filter((c) => c.statut === 'echec_livraison').length
                : filteredMandats.filter((m) => m.statut === 'echec').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Annulés</div>
            <div className="text-2xl font-bold text-gray-600">
              {activeTab === 'colis'
                ? filteredColis.filter((c) => c.statut === 'annule').length
                : filteredMandats.filter((m) => m.statut === 'annule').length}
            </div>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {activeTab === 'colis' ? (
              filteredColis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun colis dans l'historique</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expéditeur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livreur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredColis.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{c.reference}</td>
                          <td className="px-6 py-4">
                            {c.expediteur ? `${c.expediteur.prenom} ${c.expediteur.nom}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            {c.destinataire?.nom || c.pointRelais?.nom || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Building2 size={16} className="text-gray-400" />
                              {c.pointRelais?.nom || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <User size={16} className="text-gray-400" />
                              {c.livreur ? `${c.livreur.prenom} ${c.livreur.nom}` : 'Non assigné'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeClass(c.statut)}`}>
                              {getStatutLabel(c.statut)}
                            </span>
                          </td>
                          <td className="px-6 py-4">{c.tarif.total} FCFA</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock size={16} />
                              {new Date(c.updatedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => downloadReceipt(c.reference, 'colis')}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Télécharger le reçu"
                            >
                              <Download size={16} />
                              Reçu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              filteredMandats.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun mandat dans l'historique</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Administration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livreur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMandats.map((m) => (
                        <tr key={m._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{m.reference}</td>
                          <td className="px-6 py-4">
                            {m.client ? `${m.client.prenom} ${m.client.nom}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4">{m.type_document.nom}</td>
                          <td className="px-6 py-4">{m.administration.nom}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <User size={16} className="text-gray-400" />
                              {m.coursier_assigné ? `${m.coursier_assigné.prenom} ${m.coursier_assigné.nom}` : 'Non assigné'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeClass(m.statut)}`}>
                              {getStatutLabel(m.statut)}
                            </span>
                          </td>
                          <td className="px-6 py-4">{m.tarif.total} FCFA</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock size={16} />
                              {new Date(m.updatedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => downloadReceipt(m.reference, 'mandat')}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Télécharger le reçu"
                            >
                              <Download size={16} />
                              Reçu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistoryPage;
