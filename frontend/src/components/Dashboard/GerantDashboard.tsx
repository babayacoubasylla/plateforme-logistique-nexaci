// src/components/Dashboard/GerantDashboard.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Retiré si non utilisé
import { useAuth } from '../../context/AuthContext'; // Import du hook d'authentification
import { statsService } from '../../services/statsService'; // Service pour les stats gérant
import StatCard from './components/StatCard';
// import ActivityFeed from './components/ActivityFeed'; // Décommente si tu l'utilises
import QuickActions from './components/QuickActions';
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
    <div className="gerant-dashboard">
      <header className="dashboard-header">
        <h1>Bonjour, {userName} !</h1>
        <p>Gestion de votre agence logistique.</p>
      </header>

      <section className="dashboard-stats">
        <h2>Statistiques de l'Agence</h2>
        <div className="stats-grid">
          <StatCard title="Colis Total" value={stats.colis_agence.total} />
          <StatCard title="Mandats Total" value={stats.mandats_agence.total} />
          <StatCard title="Chiffre d'Affaires (Mois)" value={`XOF ${stats.performance.chiffre_affaires_mensuel.toLocaleString()}`} />
          <StatCard title="Taux de Livraison" value={`${stats.performance.taux_livraison}%`} />
        </div>
      </section>

      <section className="dashboard-summary">
        <h2>Suivi des Opérations</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Colis</h3>
            <p>En Préparation: {stats.colis_agence.en_preparation}</p>
            <p>Pris en Charge: {stats.colis_agence.pris_en_charge}</p>
            <p>En Transit: {stats.colis_agence.en_transit}</p>
            <p>En Livraison: {stats.colis_agence.en_livraison}</p>
            <p>Livrés: {stats.colis_agence.livres}</p>
          </div>
          <div className="summary-item">
            <h3>Mandats</h3>
            <p>Docs Vérifiés: {stats.mandats_agence.documents_verifies}</p>
            <p>Procuration Signée: {stats.mandats_agence.procuration_signee}</p>
            <p>Déposé Admin: {stats.mandats_agence.depose_administration}</p>
            <p>En Traitement: {stats.mandats_agence.en_traitement}</p>
            <p>En Livraison: {stats.mandats_agence.en_livraison}</p>
            <p>Livrés: {stats.mandats_agence.livres}</p>
          </div>
        </div>
      </section>

      {/* <section className="dashboard-activity">
        <h2>Activité Récente de l'Agence</h2>
        ... (Afficher les derniers colis/mandats assignés à l'agence)
      </section> */}

      <section className="dashboard-actions">
        <h2>Outils de Gestion</h2>
        <QuickActions
          actions={[
            { id: 'manage_shipments', label: 'Gérer les Colis', icon: '📦' },
            { id: 'manage_mandates', label: 'Gérer les Mandats', icon: '🏛️' },
            { id: 'assign_couriers', label: 'Assigner Coursiers', icon: '🚴‍♂️' },
            { id: 'gerant_history', label: 'Historique Agence', icon: '📜' },
            { id: 'view_reports', label: 'Rapports', icon: '📈' },
            { id: 'logout', label: 'Se Déconnecter', icon: '🚪' },
          ]}
          onAction={handleActionClick}
        />
      </section>
    </div>
  );
};

export default GerantDashboard;