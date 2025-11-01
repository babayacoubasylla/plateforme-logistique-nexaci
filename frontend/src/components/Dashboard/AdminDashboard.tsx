// src/components/Dashboard/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Retiré si non utilisé
import { useAuth } from '../../context/AuthContext'; // Import du hook d'authentification
import { statsService } from '../../services/statsService'; // Service pour les stats admin
import StatCard from './components/StatCard';
// import ActivityFeed from './components/ActivityFeed'; // Décommente si tu l'utilises
import QuickActions from './components/QuickActions';
import { Page } from '../../types'; // Assure-toi que Page inclut 'admin-dashboard'
// import './AdminDashboard.css'; // Supprimé - on utilise le style global

// Interface pour les stats admin (à adapter selon ton backend)
interface AdminStats {
  global: {
    colis: {
      total: number;
      revenus_total: number;
      moyenne_prix: number;
      statuts: Record<string, number>; // Ex: { 'livre': 100, 'en_attente': 20, ... }
    };
    mandats: {
      total: number;
      revenus_total: number;
      moyenne_prix: number;
    };
    utilisateurs: Record<string, number>; // Ex: { 'client': 500, 'livreur': 50, 'gerant': 10 }
    revenus_totaux: number;
  };
  activite_recente: Array<{
    _id: string; // Date formatée
    colis: number;
    revenus: number;
  }>;
  resume: {
    total_commandes: number;
    total_utilisateurs: number;
    revenus_mensuels: number;
    taux_croissance: string;
  };
  // Ajouter d'autres stats comme les top agences, les problèmes signalés...
}

interface Props {
  onNavigate: (page: Page) => void;
  userName: string;
}

const AdminDashboard: React.FC<Props> = ({ onNavigate, userName }) => {
  const { logout } = useAuth(); // Récupération de la fonction de déconnexion
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate(); // Retiré car non utilisé

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // --- APPEL API RÉEL ---
        // const response = await statsService.getAdminStats();
        // setStats(response.data.stats);

        // --- SIMULATION (À SUPPRIMER PLUS TARD) ---
        setTimeout(() => {
          setStats({
            global: {
              colis: {
                total: 1500,
                revenus_total: 2500000,
                moyenne_prix: 1666.67,
                statuts: { livre: 1200, en_attente: 100, en_cours: 200 }
              },
              mandats: {
                total: 800,
                revenus_total: 1800000,
                moyenne_prix: 2250
              },
              utilisateurs: { client: 1200, livreur: 60, gerant: 15, admin: 5 },
              revenus_totaux: 4300000
            },
            activite_recente: [
              { _id: '2023-10-20', colis: 50, revenus: 80000 },
              { _id: '2023-10-21', colis: 55, revenus: 90000 },
              // ... plus de données
            ],
            resume: {
              total_commandes: 2300,
              total_utilisateurs: 1280,
              revenus_mensuels: 4300000,
              taux_croissance: "12.5"
            }
          });
          setLoading(false);
        }, 500);
        // --- FIN SIMULATION ---
      } catch (err: any) {
        console.error("Erreur lors du chargement des stats admin:", err);
        setError(err.message || "Impossible de charger les données du tableau de bord.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleActionClick = (actionId: string) => {
    console.log(`[AdminDashboard] Action cliquée: ${actionId}`); // <-- LOG ICI
    switch(actionId) {
      case 'manage_users':
        onNavigate('admin/users');
        break;
      case 'manage_agencies':
        onNavigate('admin/agences');
        break;
      case 'view_all_shipments':
        onNavigate('admin/colis');
        break;
      case 'view_all_mandates':
        onNavigate('admin/mandats');
        break;
      case 'view_reports':
        onNavigate('admin/reports');
        break;
      case 'admin_history':
        onNavigate('admin_history');
        break;
      case 'system_settings':
        onNavigate('admin/settings');
        break;
      case 'logout':
        console.log("[AdminDashboard] Déconnexion demandée"); // <-- LOG ICI
        logout(); // Appelle la fonction de déconnexion du contexte
        break;
      default:
        console.warn(`[AdminDashboard] Action inconnue: ${actionId}`); // <-- LOG ICI
        // Optionnel: rediriger vers une page d'erreur ou le dashboard
        // onNavigate('admin-dashboard'); // Redirection par défaut
    }
  };

  if (loading) return <div className="dashboard-loading">Chargement du tableau de bord administrateur...</div>;
  if (error) return <div className="dashboard-error">Erreur : {error}</div>;
  if (!stats) return <div className="dashboard-no-data">Aucune donnée disponible.</div>;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Bienvenue, {userName} !</h1>
        <p>Panneau de contrôle administrateur de la plateforme.</p>
      </header>

      <section className="dashboard-stats">
        <h2>Vue Globale</h2>
        <div className="stats-grid">
          <StatCard title="Total Commandes" value={stats.resume.total_commandes} />
          <StatCard title="Total Utilisateurs" value={stats.resume.total_utilisateurs} />
          <StatCard title="Revenus Mensuels" value={`XOF ${stats.resume.revenus_mensuels.toLocaleString()}`} />
          <StatCard title="Taux Croissance" value={`${stats.resume.taux_croissance}%`} />
        </div>
      </section>

      <section className="dashboard-summary">
        <h2>Résumé Opérationnel</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Colis</h3>
            <p>Total: {stats.global.colis.total}</p>
            <p>Revenus: XOF {stats.global.colis.revenus_total.toLocaleString()}</p>
            <p>Moy. Prix: XOF {stats.global.colis.moyenne_prix.toFixed(2)}</p>
            <p>Statuts: {Object.entries(stats.global.colis.statuts).map(([status, count]) => `${status}: ${count}`).join(', ')}</p>
          </div>
          <div className="summary-item">
            <h3>Mandats</h3>
            <p>Total: {stats.global.mandats.total}</p>
            <p>Revenus: XOF {stats.global.mandats.revenus_total.toLocaleString()}</p>
            <p>Moy. Prix: XOF {stats.global.mandats.moyenne_prix.toFixed(2)}</p>
          </div>
          <div className="summary-item">
            <h3>Utilisateurs</h3>
            <p>{Object.entries(stats.global.utilisateurs).map(([role, count]) => `${role}: ${count}`).join(', ')}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-activity">
        <h2>Activité Récente</h2>
        {/* Afficher un graphique ou une liste des stats d'activité récente */}
        <ul>
          {stats.activite_recente.slice(0, 5).map(activity => (
            <li key={activity._id}>
              {activity._id}: {activity.colis} colis, XOF {activity.revenus.toLocaleString()} revenus
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-actions">
        <h2>Outils d'Administration</h2>
        <QuickActions
          actions={[
            { id: 'manage_users', label: 'Gérer Utilisateurs', icon: '👥' },
            { id: 'manage_agencies', label: 'Gérer Agences', icon: '🏢' },
            { id: 'view_all_shipments', label: 'Tous les Colis', icon: '📦' },
            { id: 'view_all_mandates', label: 'Tous les Mandats', icon: '📜' },
            { id: 'admin_history', label: 'Historique Global', icon: '📚' },
            { id: 'view_reports', label: 'Rapports', icon: '📈' },
            { id: 'system_settings', label: 'Paramètres', icon: '⚙️' },
            { id: 'logout', label: 'Se Déconnecter', icon: '🚪' },
          ]}
          onAction={handleActionClick}
        />
      </section>
    </div>
  );
};

export default AdminDashboard;
