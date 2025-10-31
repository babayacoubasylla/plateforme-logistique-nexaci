import React, { useEffect, useState } from 'react';
import { Package, Search, Truck, Flag, XCircle, Download, FileText } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { colisService } from '../../services/colisService';
import { mandatService } from '../../services/mandatService';

interface MissionColis {
  _id: string;
  reference: string;
  statut: 'en_attente' | 'en_preparation' | 'pris_en_charge' | 'en_transit' | 'en_livraison' | 'livre' | 'annule' | 'echec_livraison';
  tarif?: { total?: number };
  expediteur?: { nom?: string; prenom?: string; telephone?: string };
  destinataire?: { nom?: string; telephone?: string; adresse?: string; ville?: string };
  pointRelais?: { nom?: string; ville?: string };
  createdAt: string;
}

interface MissionsPageProps {
  onBack: () => void;
}

const MissionsPage: React.FC<MissionsPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'colis' | 'mandats'>('colis');
  const [missions, setMissions] = useState<MissionColis[]>([]);
  const [mandats, setMandats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('in_progress');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'colis') {
      fetchMissions();
    } else {
      fetchMandats();
    }
  }, [filterStatus, activeTab]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      // si filterStatus == in_progress, on ne passe pas de statut pour récupérer tout puis filtrer côté client
      const res = await apiService.getAssignedColis();
      // Le service renvoie déjà response.data, généralement { status, results, data: { colis } }
      let list: MissionColis[] = (res.data?.colis as MissionColis[]) || (res.colis as MissionColis[]) || [];
      if (filterStatus === 'in_progress') {
        list = list.filter((m) => ['en_attente','en_preparation','pris_en_charge','en_transit','en_livraison'].includes(m.statut));
      } else if (filterStatus !== 'all') {
        list = list.filter((m) => m.statut === filterStatus);
      }
      setMissions(list);
    } catch (e: any) {
      console.error('❌ [MissionsPage] Erreur:', e);
      setError(e?.response?.data?.message || e.message || 'Impossible de charger les missions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMandats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [MissionsPage] Fetching mandats assignés...');
      const res = await mandatService.getAssignedMandats();
      console.log('📦 [MissionsPage] Réponse mandats:', res);
      let list: any[] = res.data?.mandats || res.mandats || [];
      console.log('📋 [MissionsPage] Liste mandats:', list);
      if (filterStatus === 'in_progress') {
        // Afficher toutes les missions non terminées/annulées
        list = list.filter((m) => !['livre','annule','echec'].includes(m.statut));
      } else if (filterStatus !== 'all') {
        list = list.filter((m) => m.statut === filterStatus);
      }
      setMandats(list);
    } catch (e: any) {
      console.error('❌ [MissionsPage] Erreur mandats:', e);
      console.error('❌ [MissionsPage] Détails:', e.response?.data);
      setError(e?.response?.data?.message || e.message || 'Impossible de charger les mandats assignés');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (mission: MissionColis, statut: MissionColis['statut']) => {
    try {
      setUpdatingId(mission._id);
      await apiService.updateColisStatus(mission._id, statut);
      // refresh local list
      const updated = missions.map((m) => (m._id === mission._id ? { ...m, statut } : m));
      setMissions(updated);
    } catch (e: any) {
      console.error('❌ maj statut:', e);
      alert(e?.response?.data?.message || e.message || 'Impossible de mettre à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadReceipt = async (mission: MissionColis) => {
    try {
      setDownloadingRef(mission.reference);
      const blob = await colisService.downloadReceiptByReference(mission.reference);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-colis-${mission.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('❌ téléchargement reçu:', e);
      alert(e?.response?.data?.message || e.message || 'Impossible de télécharger le reçu');
    } finally {
      setDownloadingRef(null);
    }
  };

  const filtered = missions.filter((m) =>
    m.reference?.toLowerCase().includes(search.toLowerCase()) ||
    m.expediteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    m.destinataire?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMandats = mandats.filter((m) =>
    m.reference?.toLowerCase().includes(search.toLowerCase()) ||
    m.client?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    m.type_document?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="mb-4 inline-flex items-center px-3 py-1 text-sm rounded-md text-indigo-600 hover:text-indigo-800">← Retour</button>
      <h1 className="text-2xl font-bold mb-2">Mes missions</h1>
      <p className="text-gray-600 mb-6">Vos livraisons assignées</p>

      <div className="mb-4 flex gap-2">
        <button
          className={`px-3 py-1.5 text-sm rounded-md ${activeTab==='colis' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('colis')}
        >
          Colis
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-md ${activeTab==='mandats' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('mandats')}
        >
          Mandats
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            placeholder="Rechercher par référence, expéditeur, destinataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-56">
          <select
            aria-label="Filtrer par statut"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="in_progress">En cours</option>
            <option value="all">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="en_preparation">En préparation</option>
            <option value="pris_en_charge">Pris en charge</option>
            <option value="en_transit">En transit</option>
            <option value="en_livraison">En livraison</option>
            <option value="livre">Livré</option>
            <option value="echec_livraison">Échec</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">Chargement...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-600">{error}</div>
      ) : activeTab === 'colis' ? (
        filtered.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Aucune mission</div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filtered.map((m) => (
              <li key={m._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-6 w-6 text-gray-400" />
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-indigo-600">{m.reference}</div>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{m.statut.replace('_',' ')}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div><span className="font-medium">Expéditeur:</span> {m.expediteur?.prenom ? `${m.expediteur?.prenom} ` : ''}{m.expediteur?.nom}</div>
                        {m.destinataire?.nom && (
                          <div><span className="font-medium">Destinataire:</span> {m.destinataire?.nom}</div>
                        )}
                        <div className="text-gray-500">{formatDate(m.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                      {['en_attente','en_preparation','pris_en_charge'].includes(m.statut) && (
                      <button
                        disabled={updatingId === m._id}
                        className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        onClick={() => updateStatus(m, 'en_livraison')}
                        title="Démarrer la livraison"
                      >
                        <Truck className="h-4 w-4 mr-1" /> En livraison
                      </button>
                    )}
                    {m.statut === 'en_livraison' && (
                      <>
                        <button
                          disabled={updatingId === m._id}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          onClick={() => updateStatus(m, 'livre')}
                          title="Marquer livré"
                        >
                          <Flag className="h-4 w-4 mr-1" /> Livré
                        </button>
                        <button
                          disabled={updatingId === m._id}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          onClick={() => updateStatus(m, 'echec_livraison')}
                          title="Marquer échec"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Échec
                        </button>
                      </>
                    )}
                    <button
                      disabled={downloadingRef === m.reference}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                      onClick={() => downloadReceipt(m)}
                      title="Télécharger le reçu"
                    >
                      <Download className="h-4 w-4 mr-1" /> Reçu
                    </button>
                  </div>
                </div>
              </li>
              ))}
            </ul>
          </div>
        )
      ) : (
        filteredMandats.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Aucun mandat</div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredMandats.map((m) => (
                <li key={m._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-gray-400" />
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-indigo-600">{m.reference}</div>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{m.statut.replace('_',' ')}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div><span className="font-medium">Client:</span> {m.client?.prenom ? `${m.client?.prenom} ` : ''}{m.client?.nom}</div>
                          <div><span className="font-medium">Type:</span> {m.type_document?.nom}</div>
                          <div className="text-gray-500">{formatDate(m.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {['document_obtenu'].includes(m.statut) && (
                        <button
                          disabled={updatingId === m._id}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                          onClick={async () => {
                            setUpdatingId(m._id);
                            try {
                              await mandatService.updateMandatStatus(m._id, 'en_livraison');
                              setMandats(prev => prev.map(x => x._id === m._id ? { ...x, statut: 'en_livraison' } : x));
                            } catch (e: any) {
                              alert(e?.response?.data?.message || e.message || 'Impossible de mettre à jour');
                            } finally { setUpdatingId(null); }
                          }}
                          title="Démarrer la livraison"
                        >
                          <Truck className="h-4 w-4 mr-1" /> En livraison
                        </button>
                      )}
                      {m.statut === 'en_livraison' && (
                        <>
                          <button
                            disabled={updatingId === m._id}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            onClick={async () => {
                              setUpdatingId(m._id);
                              try {
                                await mandatService.updateMandatStatus(m._id, 'livre');
                                setMandats(prev => prev.map(x => x._id === m._id ? { ...x, statut: 'livre' } : x));
                              } catch (e: any) { alert(e?.response?.data?.message || e.message || 'Impossible de mettre à jour'); }
                              finally { setUpdatingId(null); }
                            }}
                            title="Marquer livré"
                          >
                            <Flag className="h-4 w-4 mr-1" /> Livré
                          </button>
                          <button
                            disabled={updatingId === m._id}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            onClick={async () => {
                              setUpdatingId(m._id);
                              try {
                                await mandatService.updateMandatStatus(m._id, 'echec');
                                setMandats(prev => prev.map(x => x._id === m._id ? { ...x, statut: 'echec' } : x));
                              } catch (e: any) { alert(e?.response?.data?.message || e.message || 'Impossible de mettre à jour'); }
                              finally { setUpdatingId(null); }
                            }}
                            title="Marquer échec"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Échec
                          </button>
                        </>
                      )}
                      <button
                        disabled={downloadingRef === m.reference}
                        className="inline-flex items-center px-2 py-1 text-xs rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                        onClick={async () => {
                          setDownloadingRef(m.reference);
                          try {
                            const blob = await mandatService.downloadReceiptByReference(m.reference);
                            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `recu-mandat-${m.reference}.pdf`;
                            document.body.appendChild(a);
                            a.click(); a.remove(); window.URL.revokeObjectURL(url);
                          } catch (e: any) {
                            alert(e?.response?.data?.message || e.message || 'Impossible de télécharger le reçu');
                          } finally { setDownloadingRef(null); }
                        }}
                        title="Télécharger le reçu"
                      >
                        <Download className="h-4 w-4 mr-1" /> Reçu
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default MissionsPage;
