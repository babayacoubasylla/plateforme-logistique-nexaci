import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api } from '../services/api';
import { theme } from '../theme';

export default function TrackingScreen() {
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onTrack = async () => {
    if (!reference) {
      Alert.alert('Référence requise', 'Veuillez saisir la référence du colis.');
      return;
    }
    try {
      setLoading(true);
      setResult(null);
      const resp = await api.get(`/api/colis/track/${encodeURIComponent(reference)}`);
      setResult(resp?.data?.data?.colis || null);
    } catch (e: any) {
      Alert.alert('Échec', e?.response?.data?.message || e?.message || 'Référence invalide ou colis introuvable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suivre un Colis</Text>
      <Text style={styles.helper}>Entrez la référence reçue lors de la création ou par WhatsApp.</Text>
      <TextInput
        placeholder="Ex: COLIS-2025-000123"
        value={reference}
        onChangeText={setReference}
        style={styles.input}
        autoCapitalize="characters"
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onTrack} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Recherche...' : 'Suivre'}</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loader}><ActivityIndicator /></View>
      )}

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Référence: {result.reference}</Text>
          <Text>Statut: {result.statut}</Text>
          {result?.pointRelais && <Text>Point relais: {result.pointRelais?.nom}</Text>}
          {result?.expediteur && <Text>Expéditeur: {result.expediteur?.prenom || ''} {result.expediteur?.nom}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: theme.spacing.lg,
    backgroundColor: '#f9fafb'
  },
  title: { 
    ...theme.typography.title, 
    marginBottom: theme.spacing.sm 
  },
  helper: { 
    ...theme.typography.caption, 
    marginBottom: theme.spacing.md 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.md, 
    marginBottom: theme.spacing.md,
    backgroundColor: '#fff',
    ...theme.typography.body
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  loader: { paddingVertical: theme.spacing.md },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: theme.borderRadius.lg, 
    padding: theme.spacing.lg, 
    marginTop: theme.spacing.md, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    ...theme.shadows.medium
  },
  cardTitle: { 
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm 
  }
});
