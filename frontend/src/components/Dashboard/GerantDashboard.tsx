// src/components/Dashboard/GerantDashboard.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Retiré si non utilisé
import { useAuth } from '../../context/AuthContext'; // Import du hook d'authentification
// import { statsService } from '../../services/statsService'; // Service pour les stats gérant
// import StatCard from './components/StatCard';
// import ActivityFeed from './components/ActivityFeed'; // Décommente si tu l'utilises
// import QuickActions from './components/QuickActions';
import { Page } from '../../types';
// Styles déplacés vers index.css pour cohérence globale

// Interface pour les stats gérant (à adapter selon ton backend)
interface GerantStats {
  colis_agence: {
    total: number;
    en_preparation: number;
    pris_en_charge: number;
    en_transit: number;
    en_livraison: number;
    livres: number;
  };
  mandats_agence: {
    total: number;
    documents_verifies: number;
    procuration_signee: number;
    depose_administration: number;
    en_traitement: number;
    en_livraison: number;
    livres: number;
  };
  // Ajouter d'autres stats comme le chiffre d'affaires, les performances...
  performance: {
    taux_livraison: string;
    chiffre_affaires_mensuel: number;
  };
}

interface Props {
  onNavigate: (page: Page) => void;
  userName: string;
}

const GerantDashboard: React.FC<Props> = ({ onNavigate, userName }) => {
  const { logout } = useAuth(); // Récupération de la fonction de déconnexion
  const [stats, setStats] = useState<GerantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate(); // Retiré car non utilisé

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // --- APPEL API RÉEL ---
        // const response = await statsService.getGerantStats();
        // setStats(response.data.stats);

        // --- SIMULATION (À SUPPRIMER PLUS TARD) ---
        setTimeout(() => {
          setStats({
            colis_agence: {
              total: 120,
              en_preparation: 15,
              pris_en_charge: 30,
              en_transit: 40,
              en_livraison: 25,
              livres: 100
            },
            mandats_agence: {
              total: 80,
              documents_verifies: 10,
              procuration_signee: 15,
              depose_administration: 20,
              en_traitement: 25,
              en_livraison: 5,
              livres: 60
            },
            performance: {
              taux_livraison: "85.0",
              chiffre_affaires_mensuel: 1500000
            }
          });
          setLoading(false);
        }, 500);
        // --- FIN SIMULATION ---
      } catch (err: any) { // Typage plus large pour l'erreur
        console.error("Erreur lors du chargement des stats gérant:", err);
        setError(err.message || "Impossible de charger les données du tableau de bord.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleActionClick = (actionId: string) => {
    if (actionId === 'logout') {
      logout(); // Déconnexion de l'utilisateur
    } else {
      // Redirige vers la page correspondante via onNavigate
      onNavigate(actionId as Page);
      // Exemples d'IDs attendus: 'manage_shipments', 'manage_mandates', etc.
    }
  };

  if (loading) return <div className="dashboard-loading">Chargement du tableau de bord...</div>;
  if (error) return <div className="dashboard-error">Erreur : {error}</div>;
  if (!stats) return <div className="dashboard-no-data">Aucune donnée disponible.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec thème ivoirien */}
        <header className="bg-gradient-to-r from-orange-ivoirien to-orange-500 rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden">
          {/* Bande drapeau ivoirien */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-ivoirien via-white to-vert-ivoirien"></div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <span className="text-3xl">🏢</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bonjour, {userName} ! 🇨🇮
              </h1>
              <p className="text-orange-100">
                Gestion de votre agence logistique ivoirienne
              </p>
            </div>
          </div>
        </header>

        {/* Statistiques avec style ivoirien */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-orange-ivoirien">📊</span>
            Statistiques de l'Agence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-ivoirien hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Colis Total</p>
                  <p className="text-3xl font-bold text-orange-ivoirien">{stats.colis_agence.total}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <span className="text-orange-ivoirien text-xl">📦</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-vert-ivoirien hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Mandats Total</p>
                  <p className="text-3xl font-bold text-vert-ivoirien">{stats.mandats_agence.total}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-vert-ivoirien text-xl">🏛️</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-ivoirien hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold text-orange-ivoirien">{stats.performance.chiffre_affaires_mensuel.toLocaleString()} FCFA</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <span className="text-orange-ivoirien text-xl">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-vert-ivoirien hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Taux de Livraison</p>
                  <p className="text-3xl font-bold text-vert-ivoirien">{stats.performance.taux_livraison}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-vert-ivoirien text-xl">📈</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Suivi des opérations avec design ivoirien */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-vert-ivoirien">📋</span>
            Suivi des Opérations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-orange-ivoirien mb-4 flex items-center gap-2">
                📦 Colis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">En Préparation</span>
                  <span className="bg-orange-ivoirien text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.colis_agence.en_preparation}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Pris en Charge</span>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.colis_agence.pris_en_charge}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700">En Transit</span>
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.colis_agence.en_transit}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">En Livraison</span>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.colis_agence.en_livraison}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Livrés</span>
                  <span className="bg-vert-ivoirien text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.colis_agence.livres}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-vert-ivoirien mb-4 flex items-center gap-2">
                🏛️ Mandats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">Docs Vérifiés</span>
                  <span className="bg-orange-ivoirien text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.mandats_agence.documents_verifies}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Procuration Signée</span>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.mandats_agence.procuration_signee}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700">Déposé Admin</span>
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.mandats_agence.depose_administration}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">En Traitement</span>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.mandats_agence.en_traitement}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Livrés</span>
                  <span className="bg-vert-ivoirien text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stats.mandats_agence.livres}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actions avec thème ivoirien */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-orange-ivoirien">🛠️</span>
            Outils de Gestion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => handleActionClick('manage_shipments')}
              className="bg-gradient-to-r from-orange-ivoirien to-orange-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl">📦</span>
              <span className="font-semibold">Gérer les Colis</span>
            </button>
            
            <button 
              onClick={() => handleActionClick('manage_mandates')}
              className="bg-gradient-to-r from-vert-ivoirien to-green-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl">🏛️</span>
              <span className="font-semibold">Gérer les Mandats</span>
            </button>
            
            <button 
              onClick={() => handleActionClick('assign_couriers')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl">🚴‍♂️</span>
              <span className="font-semibold">Assigner Coursiers</span>
            </button>
            
            <button 
              onClick={() => handleActionClick('gerant_history')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl">📜</span>
              <span className="font-semibold">Historique Agence</span>
            </button>
            
            <button 
              onClick={() => handleActionClick('view_reports')}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl">📈</span>
              <span className="font-semibold">Rapports</span>
            </button>
            
            <button 
              onClick={() => handleActionClick('logout')}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl">🚪</span>
              <span className="font-semibold">Se Déconnecter</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GerantDashboard;