import React, { useState, useEffect } from 'react';
import { BarChart, FileText, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ReportData {
  colisStats: {
    total: number;
    enAttente: number;
    enCours: number;
    livres: number;
    annules: number;
  };
  mandatsStats: {
    total: number;
    montantTotal: number;
    enAttente: number;
    completes: number;
  };
  periodStats: {
    thisMonth: {
      colis: number;
      mandats: number;
      revenue: number;
    };
    lastMonth: {
      colis: number;
      mandats: number;
      revenue: number;
    };
  };
}

interface AdminReportsPageProps {
  onBack: () => void;
}

const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('thisMonth');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simuler la récupération des données de rapport depuis l'API
      // TODO: Remplacer par un véritable appel API
      const data: ReportData = {
        colisStats: {
          total: 150,
          enAttente: 45,
          enCours: 30,
          livres: 65,
          annules: 10
        },
        mandatsStats: {
          total: 85,
          montantTotal: 2500000,
          enAttente: 20,
          completes: 65
        },
        periodStats: {
          thisMonth: {
            colis: 45,
            mandats: 25,
            revenue: 750000
          },
          lastMonth: {
            colis: 38,
            mandats: 22,
            revenue: 680000
          }
        }
      };
      
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Chargement des rapports...</div>;
  if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;
  if (!reportData) return <div className="p-6">Aucune donnée disponible</div>;
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
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
          <p className="mt-1 text-sm text-gray-600">
            Consultez les rapports et analyses de la plateforme
          </p>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="date-range" className="text-sm text-gray-700">Période :</label>
          <select
            id="date-range"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="thisMonth">Ce mois</option>
            <option value="lastMonth">Mois dernier</option>
            <option value="thisYear">Cette année</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rapport des Colis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Rapport des Colis</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-semibold">{reportData.colisStats.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-xl font-semibold">{reportData.colisStats.enAttente}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">En cours</p>
                  <p className="text-xl font-semibold">{reportData.colisStats.enCours}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Livrés</p>
                  <p className="text-xl font-semibold">{reportData.colisStats.livres}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rapport des Mandats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Rapport des Mandats</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-semibold">{reportData.mandatsStats.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant total</p>
                  <p className="text-xl font-semibold">{reportData.mandatsStats.montantTotal.toLocaleString()} XOF</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-xl font-semibold">{reportData.mandatsStats.enAttente}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Complétés</p>
                  <p className="text-xl font-semibold">{reportData.mandatsStats.completes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rapport Périodique */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Comparaison Périodique</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Ce mois vs Mois dernier</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Colis</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{reportData.periodStats.thisMonth.colis}</span>
                    <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mandats</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{reportData.periodStats.thisMonth.mandats}</span>
                    <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Revenus</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{reportData.periodStats.thisMonth.revenue.toLocaleString()} XOF</span>
                    <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-gray-500">
          * Les données sont mises à jour en temps réel. Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
};

export default AdminReportsPage;