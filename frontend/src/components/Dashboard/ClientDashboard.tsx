// src/components/Dashboard/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Retiré si non utilisé
import { useAuth } from '../../context/AuthContext'; // Import du hook d'authentification
import { statsService } from '../../services/statsService'; // Service pour les stats client
import StatCard from './components/StatCard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import { Page } from '../../types';
// import './ClientDashboard.css'; // Supprimé - on utilise le style global

interface ClientStats {
  colis: {
    total: number;
    en_attente: number;
    en_cours: number;
    livres: number;
    depenses_total: number;
  };
  mandats: {
    total: number;
    en_attente: number;
    en_cours: number;
    completes: number;
    depenses_total: number;
  };
  derniers_colis: any[]; // Remplacer 'any' par le type Colis
  derniers_mandats: any[]; // Remplacer 'any' par le type Mandat
  resume: {
    total_commandes: number;
    total_depenses: number;
    en_cours: number;
    taux_success: string;
  };
}

interface Props {
  onNavigate: (page: Page) => void;
  userName: string;
}

const ClientDashboard: React.FC<Props> = ({ onNavigate, userName }) => {
  const { logout } = useAuth(); // Récupération de la fonction de déconnexion
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState(null); // Pour les données de colis (si nécessaire)
  const [mandateData, setMandateData] = useState(null); // Pour les données de mandat (si nécessaire)
  const [trackingNumber, setTrackingNumber] = useState(''); // Pour le numéro de suivi (si nécessaire)
  // const navigate = useNavigate(); // Retiré car non utilisé

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        try {
          const response = await statsService.getClientStats();
          console.log("Réponse stats client:", response);
          setStats(response.data.stats);
        } catch (err) {
          console.error("Erreur lors du chargement des stats:", err);
          throw err;
        } finally {
          setLoading(false);
        }
        // --- FIN SIMULATION ---
      } catch (err: any) {
        console.error("Erreur lors du chargement des stats client:", err);
        setError(err.message || "Impossible de charger les données du tableau de bord.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleActionClick = (actionId: string) => {
    switch(actionId) {
      case 'create_shipping':
        onNavigate('shipping');
        break;
      case 'create_mandate':
        onNavigate('mandate');
        break;
      case 'view_history':
        onNavigate('history');
        break;
      case 'view_tracking': // Nouvelle action pour le suivi
        onNavigate('tracking');
        break;
      case 'view_profile':
        onNavigate('profile');
        break;
      case 'logout':
        logout(); // Déconnexion de l'utilisateur
        break;
      default:
        console.warn("Action inconnue:", actionId);
        // onNavigate(actionId); // Redirection par défaut si l'ID correspond à une page
    }
  };

  const handleBackToHome = () => {
    // Logique pour retourner à la page d'accueil du dashboard client si nécessaire
    // Par exemple, fermer un modal ou réinitialiser l'état
    console.log("Retour à l'accueil du dashboard client");
  };

  if (loading) return <div className="dashboard-loading">Chargement du tableau de bord...</div>;
  if (error) return <div className="dashboard-error">Erreur : {error}</div>;
  if (!stats) return <div className="dashboard-no-data">Aucune donnée disponible.</div>;

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <h1>Bienvenue, {userName} !</h1>
        <p>Gérez vos expéditions et mandats administratifs.</p>
      </header>

      <section className="dashboard-stats">
        <h2>Vos Statistiques</h2>
        <div className="stats-grid">
          <StatCard title="Total Commandes" value={stats.resume.total_commandes} />
          <StatCard title="Total Dépensé" value={`XOF ${stats.resume.total_depenses.toFixed(2)}`} />
          <StatCard title="En Cours" value={stats.resume.en_cours} />
          <StatCard title="Taux de Succès" value={`${stats.resume.taux_success}%`} />
        </div>
      </section>

      <section className="dashboard-summary">
        <h2>Résumé</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Colis</h3>
            <p>Total: {stats.colis.total}</p>
            <p>En Attente: {stats.colis.en_attente}</p>
            <p>En Cours: {stats.colis.en_cours}</p>
            <p>Livrés: {stats.colis.livres}</p>
          </div>
          <div className="summary-item">
            <h3>Mandats</h3>
            <p>Total: {stats.mandats.total}</p>
            <p>En Attente: {stats.mandats.en_attente}</p>
            <p>En Cours: {stats.mandats.en_cours}</p>
            <p>Complétés: {stats.mandats.completes}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-activity">
        <h2>Activité Récente</h2>
        <ActivityFeed
          title="Derniers Colis"
          activities={stats.derniers_colis}
          type="colis"
          onViewAll={() => onNavigate('history')}
        />
        <ActivityFeed
          title="Derniers Mandats"
          activities={stats.derniers_mandats}
          type="mandat"
          onViewAll={() => onNavigate('history')}
        />
      </section>

      <section className="dashboard-actions">
        <h2>Actions Rapides</h2>
        {/* Ajout de l'action 'view_tracking' */}
        <QuickActions
          actions={[
            { id: 'create_shipping', label: 'Envoyer un Colis', icon: '📦' },
            { id: 'create_mandate', label: 'Demander un Mandat', icon: '🏛️' },
            { id: 'view_history', label: 'Historique', icon: '🕒' },
            { id: 'view_tracking', label: 'Suivre un Colis/Mandat', icon: '🔍' }, // <-- Nouveau bouton
            { id: 'view_profile', label: 'Mon Profil', icon: '👤' },
            { id: 'logout', label: 'Se Déconnecter', icon: '🚪' },
          ]}
          onAction={handleActionClick}
        />
      </section>
    </div>
  );
};

export default ClientDashboard;