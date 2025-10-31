import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { theme } from '../theme';
import StatusBadge from '../components/ui/StatusBadge';
import { api } from '../services/api';
import { formatDate } from '../utils/dateFormatter';

type Props = { route: { params: { id: string } } };

export default function ColisDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [colis, setColis] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await api.get(`/api/colis/${id}`);
      setColis(resp?.data?.data?.colis || resp?.data?.colis || null);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || e?.message || 'Chargement impossible');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const downloadReceipt = async () => {
    try {
      if (!colis?._id && !colis?.reference) return;
      const { API_URL } = await import('../config/config');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.getItem('token');
      const url = `${API_URL}/api/colis/${colis._id}/receipt`;
      const fileUri = `${FileSystem.cacheDirectory}recu-colis-${colis.reference}.pdf`;
      const dl = await FileSystem.downloadAsync(url, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(dl.uri, { mimeType: 'application/pdf', dialogTitle: 'Reçu Colis' });
      } else {
        Alert.alert('Téléchargé', `Reçu enregistré: ${dl.uri}`);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Téléchargement impossible');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (!colis) {
    return <View style={styles.center}><Text style={styles.helper}>Colis introuvable.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Détail du Colis</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.ref}>Réf: {colis.reference}</Text>
          <StatusBadge status={colis.statut} />
        </View>
        {colis?.destinataire?.nom && <Text style={styles.info}>👤 {colis.destinataire.nom}</Text>}
        {colis?.destinataire?.telephone && <Text style={styles.info}>📞 {colis.destinataire.telephone}</Text>}
        {colis?.destinataire?.adresse && <Text style={styles.info}>📍 {colis.destinataire.adresse}, {colis.destinataire.ville}</Text>}
        {colis?.pointRelais?.nom && <Text style={styles.info}>🏢 Point relais: {colis.pointRelais.nom}</Text>}
        {colis?.details_colis?.poids && <Text style={styles.info}>📦 Poids: {colis.details_colis.poids} kg</Text>}
        {colis?.createdAt && <Text style={styles.date}>🕒 {formatDate(colis.createdAt)}</Text>}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.section}>Historique</Text>
        <TouchableOpacity style={[styles.action, { backgroundColor: theme.colors.success }]} onPress={downloadReceipt}>
          <Text style={styles.actionText}>⬇️ Reçu PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline historique */}
      {Array.isArray(colis.historique) && colis.historique.length > 0 ? (
        <View style={{ paddingVertical: theme.spacing.sm }}>
          {colis.historique.sort((a: any,b: any)=> new Date(a.date).getTime()-new Date(b.date).getTime()).map((h: any, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <Text>•</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ ...theme.typography.body }}>{h.description || h.statut}</Text>
                {h.date ? <Text style={{ ...theme.typography.caption, color: '#9ca3af' }}>{new Date(h.date).toLocaleString()}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.helper}>Aucun historique.</Text>
      )}

      {/* Photos */}
      <Text style={styles.section}>Photos</Text>
      {Array.isArray(colis.photos) && colis.photos.length > 0 ? (
        <View style={styles.photosList}>
          {colis.photos.map((p: any, idx: number) => (
            <View key={idx} style={styles.photoItem}>
              <Text style={styles.photoName}>• {p.nom_fichier} ({new Date(p.date_upload).toLocaleString()})</Text>
              <Image 
                source={{ uri: p.url.startsWith('http') ? p.url : `${colis.baseUrl || ''}${p.url}` }} 
                style={styles.photoImage} 
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.helper}>Aucune photo.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  title: { ...theme.typography.title, marginBottom: theme.spacing.lg },
  card: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: theme.spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { ...theme.typography.subtitle },
  info: { ...theme.typography.body, color: '#6b7280', marginTop: theme.spacing.xs },
  date: { ...theme.typography.caption, color: '#9ca3af', marginTop: theme.spacing.xs },
  section: { ...theme.typography.subtitle, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  action: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.md },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  photosList: { marginTop: theme.spacing.sm },
  photoItem: { paddingVertical: theme.spacing.sm },
  photoName: { ...theme.typography.body, marginBottom: theme.spacing.xs },
  photoImage: { width: '100%', height: 200, borderRadius: theme.borderRadius.md, resizeMode: 'cover' },
  helper: { ...theme.typography.caption, color: '#9ca3af' }
});
