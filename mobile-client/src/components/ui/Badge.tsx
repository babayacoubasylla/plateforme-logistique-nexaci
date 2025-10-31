import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Badge({ label, color = '#1976d2' }: { label: string; color?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}> 
      <Text style={styles.text}>{label}</Text>
    </View>
  );
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
