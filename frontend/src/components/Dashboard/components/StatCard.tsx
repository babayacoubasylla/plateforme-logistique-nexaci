// src/components/Dashboard/components/StatCard.tsx
import React from 'react';
// import './StatCard.css'; // Styles optionnels

interface StatCardProps {
  title: string;
  value: string | number;
  // Ajouter des props pour l'icône, la couleur, etc. si nécessaire
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="stat-card"> {/* Applique le style défini dans index.css ou App.css */}
      <h3>{title}</h3>
      <p className="stat-value">{value}</p> {/* Applique le style défini dans index.css ou App.css */}
    </div>
  );
};

export default StatCard;