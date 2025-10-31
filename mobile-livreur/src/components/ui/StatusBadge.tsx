import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colorForStatus } from '../../theme/colors';

export default function StatusBadge({ status, label }: { status?: string; label?: string }) {
  const color = colorForStatus(status);
  const text = label || formatStatus(status);
  return (
    <View style={[styles.badge, { backgroundColor: color }]}> 
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

function formatStatus(s?: string) {
  if (!s) return 'Inconnu';
  const map: Record<string, string> = {
    en_attente: 'En attente',
    en_preparation: 'Préparation',
    pris_en_charge: 'Pris en charge',
    en_transit: 'En transit',
    en_livraison: 'En livraison',
    livre: 'Livré',
    echec_livraison: 'Échec',
    annule: 'Annulé',
  };
  return map[s] || s;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start'
  },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' }
});
