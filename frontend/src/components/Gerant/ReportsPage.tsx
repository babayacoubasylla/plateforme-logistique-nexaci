import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, Package, FileText } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ReportStats {
  colis: {
    total: number;
    enAttente: number;
    enCours: number;
    livres: number;
    annules: number;
  };
  mandats: {
    total: number;
    enAttente: number;
    enCours: number;
    termines: number;
    rejetes: number;
  };
  performance: {
    tauxLivraison: number;
    delaiMoyenLivraison: number;
    satisfactionClient: number;
  };
}

interface ReportsPageProps {
  onBack: () => void;
  agenceId: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onBack, agenceId }) => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState('mois'); // 'jour', 'semaine', 'mois', 'annee'

  useEffect(() => {
    fetchStats();
  }, [agenceId, periode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Simuler des stats pour la démo (remplacer par API réelle plus tard)
      setTimeout(() => {
        setStats({
          colis: {
            total: 45,
            enAttente: 5,
            enCours: 12,
            livres: 25,
            annules: 3
          },
          mandats: {
            total: 28,
            enAttente: 3,
            enCours: 8,
            termines: 15,
            rejetes: 2
          },
          performance: {
            tauxLivraison: 87.5,
            delaiMoyenLivraison: 2.3,
            satisfactionClient: 92
          }
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // TODO: Implémenter l'export des rapports
      const response = await apiService.exportAgenceReport(agenceId, periode);
      // Télécharger le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-${periode}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Rapports et Statistiques</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
            title="Sélectionner la période"
            aria-label="Sélectionner la période"
          >
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="annee">Cette année</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-8">
          {/* Statistiques des colis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-indigo-600" />
              Statistiques des Colis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">{stats.colis.total}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-yellow-600">En attente</div>
                <div className="text-2xl font-bold text-yellow-700">{stats.colis.enAttente}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-600">En cours</div>
                <div className="text-2xl font-bold text-blue-700">{stats.colis.enCours}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600">Livrés</div>
                <div className="text-2xl font-bold text-green-700">{stats.colis.livres}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-red-600">Annulés</div>
                <div className="text-2xl font-bold text-red-700">{stats.colis.annules}</div>
              </div>
            </div>
          </div>

          {/* Statistiques des mandats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Statistiques des Mandats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">{stats.mandats.total}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-yellow-600">En attente</div>
                <div className="text-2xl font-bold text-yellow-700">{stats.mandats.enAttente}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-600">En cours</div>
                <div className="text-2xl font-bold text-blue-700">{stats.mandats.enCours}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600">Terminés</div>
                <div className="text-2xl font-bold text-green-700">{stats.mandats.termines}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-red-600">Rejetés</div>
                <div className="text-2xl font-bold text-red-700">{stats.mandats.rejetes}</div>
              </div>
            </div>
          </div>

          {/* Indicateurs de performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              Indicateurs de Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-indigo-600">Taux de livraison</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {stats.performance.tauxLivraison}%
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-indigo-600">Délai moyen de livraison</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {stats.performance.delaiMoyenLivraison} jours
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-indigo-600">Satisfaction client</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {stats.performance.satisfactionClient}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;