/**
 * Formate une date ISO en format lisible français
 */
export function formatDate(isoString: string | Date | undefined | null): string {
  if (!isoString) return 'Date inconnue';
  
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) return 'Date invalide';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // Il y a moins d'une heure
    if (diffMins < 60) {
      if (diffMins < 1) return 'À l\'instant';
      return `Il y a ${diffMins} min`;
    }
    
    // Il y a moins de 24h
    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    }
    
    // Il y a moins de 7 jours
    if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    // Format complet pour dates plus anciennes
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const currentYear = now.getFullYear();
    
    // Afficher l'année seulement si différente de l'année courante
    if (year === currentYear) {
      return `${day} ${month}`;
    }
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Formate une date en format complet (jour mois année)
 */
export function formatFullDate(isoString: string | Date | undefined | null): string {
  if (!isoString) return 'Date inconnue';
  
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    
    if (isNaN(date.getTime())) return 'Date invalide';
    
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return 'Date invalide';
  }
}
