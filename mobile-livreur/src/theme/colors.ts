// 🇨🇮 Couleurs du drapeau ivoirien : Orange, Blanc, Vert
export const colors = {
  primary: '#ff7300',      // Orange ivoirien principal
  secondary: '#ffffff',    // Blanc ivoirien
  success: '#009639',      // Vert ivoirien
  warning: '#ffb347',      // Orange plus clair
  danger: '#dc2626',       // Rouge pour erreurs
  info: '#0ea5e9',         // Bleu pour informations
  purple: '#9c27b0',       // Violet maintenu
  neutral: '#6b7280',      // Gris neutre
  
  // Variations ivoiriennes
  orangePrimary: '#ff7300', // Orange principal
  orangeLight: '#ffb347',   // Orange clair
  orangeDark: '#e65100',    // Orange foncé
  vertIvoirien: '#009639',  // Vert du drapeau
  vertLight: '#22c55e',     // Vert clair
  blancIvoirien: '#ffffff', // Blanc pur
  background: '#f8fafc',    // Fond très clair
};

export const statusColors: Record<string, string> = {
  // Statuts livraison - couleurs ivoiriennes
  en_attente: colors.orangeLight,
  en_preparation: colors.orangePrimary,
  pris_en_charge: colors.info,
  en_transit: colors.info,
  en_livraison: colors.orangeDark,
  livre: colors.vertIvoirien,
  echec_livraison: colors.danger,
  annule: colors.neutral
};

export function colorForStatus(status?: string) {
  if (!status) return colors.neutral;
  return statusColors[status] || colors.neutral;
}
