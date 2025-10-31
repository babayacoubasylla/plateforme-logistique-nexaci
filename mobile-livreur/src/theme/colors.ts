export const colors = {
  primary: '#1976d2',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  info: '#2196f3',
  purple: '#9c27b0',
  neutral: '#757575'
};

export const statusColors: Record<string, string> = {
  en_attente: '#ff9800',
  en_preparation: '#ffb74d',
  pris_en_charge: '#2196f3',
  en_transit: '#2196f3',
  en_livraison: '#9c27b0',
  livre: '#4caf50',
  echec_livraison: '#f44336',
  annule: '#9e9e9e'
};

export function colorForStatus(status?: string) {
  if (!status) return colors.neutral;
  return statusColors[status] || colors.neutral;
}
