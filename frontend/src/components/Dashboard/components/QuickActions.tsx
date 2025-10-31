// src/components/Dashboard/components/QuickActions.tsx
import React from 'react';
// import './QuickActions.css'; // Styles optionnels - on utilise le style global

interface Action {
  id: string;
  label: string;
  icon?: string; // Optionnel
}

interface QuickActionsProps {
  actions: Action[];
  onAction: (actionId: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions, onAction }) => {
  return (
    <div className="quick-actions"> {/* Applique le style défini dans index.css ou App.css */}
      {actions.map(action => (
        <button
          key={action.id}
          className="quick-action-button" // Applique le style défini dans index.css ou App.css
          onClick={() => {
            console.log(`[QuickActions] Bouton cliqué: ${action.id}`); // <-- LOG ICI
            onAction(action.id);
          }}
        >
          {action.icon && <span className="action-icon">{action.icon}</span>} {/* Applique le style défini dans index.css ou App.css */}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
