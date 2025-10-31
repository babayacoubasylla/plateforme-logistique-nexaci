// src/components/Dashboard/LivreurDashboard.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Retiré si non utilisé
import { useAuth } from '../../context/AuthContext'; // Import du hook d'authentification
import { statsService } from '../../services/statsService'; // Service pour les stats livreur
import StatCard from './components/StatCard';
import ActivityFeed from './components/ActivityFeed'; // Peut-être utilisé pour les missions
import QuickActions from './components/QuickActions';
import { Page } from '../../types';
// import './LivreurDashboard.css'; // Supprimé - on utilise le style global

// Interface pour les stats livreur (à adapter selon ton backend)
interface LivreurStats {
  colis: {
    total: number;
    livres: number;
    en_cours: number;
    revenus_total: number;
  };
  mandats: {
    total: number;
    livres: number;
    en_cours: number;
    revenus_total: number;
  };
  missions_du_jour: {
    colis: any[]; // Remplacer 'any' par le type Colis
    mandats: any[]; // Remplacer 'any' par le type Mandat
    total: number;
  };
  performance: {
    taux_livraison: string;
    revenus_mensuels: number;
    efficacite: string;
  };
}

interface Props {
  onNavigate: (page: Page) => void;
  userName: string;
}

const LivreurDashboard: React.FC<Props> = ({ onNavigate, userName }) => {
  const { logout } = useAuth(); // Récupération de la fonction de déconnexion
  const [stats, setStats] = useState<LivreurStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate(); // Retiré car non utilisé

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await statsService.getLivreurStats();
        setStats(response.data.stats as LivreurStats);
      } catch (err: any) {
        console.error("Erreur lors du chargement des stats livreur:", err);
        setError(err.response?.data?.message || err.message || "Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleActionClick = (actionId: string) => {
    if (actionId === 'logout') {
      logout();
      return;
    }
    // Mapping des actions vers des pages connues
    switch (actionId) {
      case 'view_today_missions':
        onNavigate('livreur_missions');
        break;
      case 'update_delivery_status':
        onNavigate('livreur_missions');
        break;
      case 'view_history':
        onNavigate('livreur_history');
        break;
      case 'view_profile':
        onNavigate('profile');
        break;
      default:
        // Tente une navigation directe si c'est déjà une Page valide
        onNavigate(actionId as Page);
        break;
    }
  };

  if (loading) return <div className="dashboard-loading">Chargement du tableau de bord...</div>;
  if (error) return <div className="dashboard-error">Erreur : {error}</div>;
  if (!stats) return <div className="dashboard-no-data">Aucune donnée disponible.</div>;

  return (
    <div className="livreur-dashboard">
      <header className="dashboard-header">
        <h1>Salut, {userName} !</h1>
        <p>Gérez vos livraisons du jour.</p>
      </header>

      <section className="dashboard-stats">
        <h2>Vos Performances</h2>
        <div className="stats-grid">
          <StatCard title="Missions du Jour" value={stats.missions_du_jour.total} />
          <StatCard title="Taux de Livraison" value={`${stats.performance.taux_livraison}%`} />
          <StatCard title="Revenus Mensuels" value={`XOF ${stats.performance.revenus_mensuels.toLocaleString()}`} />
          <StatCard title="Efficacité" value={`${stats.performance.efficacite}%`} />
        </div>
      </section>

      <section className="dashboard-summary">
        <h2>Résumé des Livraisons</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Colis</h3>
            <p>Total: {stats.colis.total}</p>
            <p>Livrés: {stats.colis.livres}</p>
            <p>En Cours: {stats.colis.en_cours}</p>
            <p>Revenus: XOF {stats.colis.revenus_total.toLocaleString()}</p>
          </div>
          <div className="summary-item">
            <h3>Mandats</h3>
            <p>Total: {stats.mandats.total}</p>
            <p>Livrés: {stats.mandats.livres}</p>
            <p>En Cours: {stats.mandats.en_cours}</p>
            <p>Revenus: XOF {stats.mandats.revenus_total.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-activity">
        <h2>Missions du Jour</h2>
        <p>Vous avez {stats.missions_du_jour.total} missions aujourd'hui.</p>
        <div className="mt-4 grid gap-3">
          {stats.missions_du_jour.colis && stats.missions_du_jour.colis.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Colis à livrer</h3>
              <ul className="divide-y divide-gray-200 bg-white rounded-md shadow">
                {stats.missions_du_jour.colis.map((c: any) => (
                  <li key={c._id} className="p-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.reference}</div>
                      <div className="text-gray-600">Statut: {c.statut}</div>
                    </div>
                    <div className="text-gray-700">{(c.tarif?.total || 0).toLocaleString()} XOF</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stats.missions_du_jour.mandats && stats.missions_du_jour.mandats.length > 0 && (
            <div>
              <h3 className="font-semibold mt-4 mb-2">Mandats</h3>
              <ul className="divide-y divide-gray-200 bg-white rounded-md shadow">
                {stats.missions_du_jour.mandats.map((m: any) => (
                  <li key={m._id} className="p-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{m.reference}</div>
                      <div className="text-gray-600">Statut: {m.statut}</div>
                    </div>
                    <div className="text-gray-700">{(m.tarif?.total || 0).toLocaleString()} XOF</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-actions">
        <h2>Mes Actions</h2>
        <QuickActions
          actions={[
            { id: 'view_today_missions', label: 'Mes Missions', icon: '📋' },
            { id: 'view_history', label: 'Mon Historique', icon: '📜' },
            { id: 'update_delivery_status', label: 'Mettre à Jour', icon: '🔄' },
            { id: 'view_performance', label: 'Ma Performance', icon: '📊' },
            { id: 'view_profile', label: 'Mon Profil', icon: '👤' },
            { id: 'logout', label: 'Se Déconnecter', icon: '🚪' },
          ]}
          onAction={handleActionClick}
        />
      </section>
    </div>
  );
};

export default LivreurDashboard;