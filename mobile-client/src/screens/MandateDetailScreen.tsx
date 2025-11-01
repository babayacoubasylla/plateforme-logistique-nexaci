import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../theme';
import StatusBadge from '../components/ui/StatusBadge';
import { getMandatById, uploadMandatDocuments, type UploadDoc } from '../services/mandatService';
import { formatDate } from '../utils/dateFormatter';

type Props = { route: { params: { id: string } } };

export default function MandateDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [mandat, setMandat] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getMandatById(id);
      setMandat(resp?.data?.data?.mandat || resp?.data?.mandat || null);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || e?.message || 'Chargement impossible');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const pickImage = async (field: UploadDoc['field']) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès aux photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        await doUpload([{ field, uri: result.assets[0].uri, name: result.assets[0].fileName || 'photo.jpg', type: result.assets[0].mimeType || 'image/jpeg' }]);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Sélection image impossible');
    }
  };

  const pickDocument = async (field: UploadDoc['field']) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false, type: ['application/pdf', 'image/*'] });
      if (res.canceled || !res.assets || !res.assets[0]) return;
      const file = res.assets[0];
      await doUpload([{ field, uri: file.uri, name: file.name || 'document.pdf', type: file.mimeType || 'application/pdf' }]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Sélection document impossible');
    }
  };

  const doUpload = async (files: UploadDoc[]) => {
    try {
      setUploading(true);
      await uploadMandatDocuments(id, files);
      await load();
      Alert.alert('Succès', 'Document(s) uploadé(s).');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || e?.message || 'Upload impossible');
    } finally { setUploading(false); }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (!mandat) {
    return <View style={styles.center}><Text style={styles.helper}>Mandat introuvable.</Text></View>;
  }

  const downloadReceipt = async () => {
    try {
      if (!mandat?._id && !mandat?.reference) return;
      const { API_URL } = await import('../config/config');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.getItem('token');
      const url = `${API_URL}/api/mandats/${mandat._id}/receipt`;
  const fileUri = `${(FileSystem as any).cacheDirectory || ''}recu-mandat-${mandat.reference}.pdf`;
      const dl = await FileSystem.downloadAsync(url, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(dl.uri, { mimeType: 'application/pdf', dialogTitle: 'Reçu Mandat' });
      } else {
        Alert.alert('Téléchargé', `Reçu enregistré: ${dl.uri}`);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Téléchargement impossible');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Détail du Mandat</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.ref}>Réf: {mandat.reference}</Text>
          <StatusBadge status={mandat.statut} />
        </View>
        {mandat?.type_document?.nom && <Text style={styles.info}>📑 {mandat.type_document.nom}</Text>}
        {mandat?.administration?.nom && <Text style={styles.info}>🏢 {mandat.administration.nom}</Text>}
        {mandat?.createdAt && <Text style={styles.date}>🕒 {formatDate(mandat.createdAt)}</Text>}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.section}>Documents</Text>
        <TouchableOpacity style={[styles.action, { backgroundColor: theme.colors.success }]} onPress={downloadReceipt}>
          <Text style={styles.actionText}>⬇️ Reçu PDF</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rowWrap}>
        <TouchableOpacity style={styles.action} disabled={uploading} onPress={() => pickImage('photo')}>
          <Text style={styles.actionText}>🖼️ Ajouter une photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} disabled={uploading} onPress={() => pickDocument('cni')}>
          <Text style={styles.actionText}>🪪 Importer CNI (PDF/Image)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} disabled={uploading} onPress={() => pickDocument('procuration')}>
          <Text style={styles.actionText}>✍️ Procuration</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} disabled={uploading} onPress={() => pickDocument('extrait_naissance')}>
          <Text style={styles.actionText}>📝 Extrait de naissance</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline historique */}
      <Text style={styles.section}>Historique</Text>
      {Array.isArray(mandat.historique) && mandat.historique.length > 0 ? (
        <View style={{ paddingVertical: theme.spacing.sm }}>
          {mandat.historique.sort((a: any,b: any)=> new Date(a.date).getTime()-new Date(b.date).getTime()).map((h: any, idx: number) => (
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

      {/* Documents */}
      <Text style={styles.section}>Documents</Text>
      {Array.isArray(mandat.documents) && mandat.documents.length > 0 ? (
        <View style={styles.docsList}>
          {mandat.documents.map((d: any, idx: number) => (
            <View key={idx} style={styles.docItem}>
              <Text style={styles.docName}>• {d.nom_fichier} ({new Date(d.date_upload).toLocaleDateString()})</Text>
              {d.url?.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                <Image source={{ uri: d.url.startsWith('http') ? d.url : `${mandat.baseUrl || ''}${d.url}` }} style={styles.docImage} />
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.helper}>Aucun document pour le moment.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  title: { ...theme.typography.title, marginBottom: theme.spacing.lg },
  card: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, borderWidth: 1, borderColor: '#e5e7eb' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { ...theme.typography.subtitle },
  info: { ...theme.typography.body, color: '#6b7280', marginTop: theme.spacing.xs },
  date: { ...theme.typography.caption, color: '#9ca3af', marginTop: theme.spacing.xs },
  section: { ...theme.typography.subtitle, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  action: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md },
  actionText: { color: '#fff', fontWeight: '600' },
  docsList: { marginTop: theme.spacing.md },
  docItem: { paddingVertical: theme.spacing.sm },
  docName: { ...theme.typography.body },
  docImage: { width: '100%', height: 160, borderRadius: theme.borderRadius.sm, marginTop: theme.spacing.xs, resizeMode: 'cover' },
  helper: { ...theme.typography.caption }
});
