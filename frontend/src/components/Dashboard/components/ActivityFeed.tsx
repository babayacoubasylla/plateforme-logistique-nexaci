// src/components/Dashboard/components/ActivityFeed.tsx
import React from 'react';
// import './ActivityFeed.css'; // Supprimé - on utilise le style global

// Interface pour les éléments d'activité (à adapter selon tes données réelles)
// Pour l'instant, on utilise un type générique
interface Activity {
  id: string;
  // Ajoute d'autres champs pertinents selon le type d'activité (colis ou mandat)
  [key: string]: any; // Placeholder pour d'autres propriétés
}

interface ActivityFeedProps {
  title: string;
  activities: Activity[]; // Liste des activités à afficher
  type: 'colis' | 'mandat'; // Pour personnaliser l'affichage si nécessaire plus tard
  onViewAll: () => void; // Fonction appelée quand l'utilisateur clique sur "Tout voir"
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ title, activities, type, onViewAll }) => {
  return (
    <div className="activity-feed"> {/* Classe CSS pour le style global */}
      <div className="activity-header"> {/* Classe CSS pour le style global */}
        <h3>{title}</h3>
        <button onClick={onViewAll} className="view-all-button"> {/* Classe CSS pour le style global */}
          Tout voir
        </button>
      </div>
      {activities && activities.length > 0 ? (
        <ul className="activity-list"> {/* Classe CSS pour le style global */}
          {activities.slice(0, 3).map((activity, index) => ( // Affiche uniquement les 3 premiers
            <li
              key={activity.id || `${type}-${index}-${activity.reference || activity._id || 'item'}`}
              className="activity-item"
            > {/* Classe CSS pour le style global */}
              {/* Affichage basique de l'ID. À adapter selon tes besoins. */}
              <span>ID: {activity.id}</span>
              {/* Ajoute d'autres détails pertinents ici si nécessaire */}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-activity-message"> {/* Classe CSS pour le style global */}
          Aucune activité récente.
        </p>
      )}
    </div>
  );
};

export default ActivityFeed;