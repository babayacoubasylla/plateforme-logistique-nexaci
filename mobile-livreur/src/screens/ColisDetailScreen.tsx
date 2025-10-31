import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { getColisDetails, updateColisStatus } from '@/services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { theme } from '../theme';
import { formatDate } from '../utils/dateFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'ColisDetail'>;

export default function ColisDetailScreen({ route, navigation }: Props) {
  const { colisId } = route.params;
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [colis, setColis] = useState<any>(null);
  const [commentaire, setCommentaire] = useState('');
  const [photoPreuve, setPhotoPreuve] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    load();
    captureGPS();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getColisDetails(colisId);
      const c = resp?.data?.data?.colis;
      setColis(c);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger les détails' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const captureGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setGpsCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      // Silencieux si GPS non disponible
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Accès à la caméra nécessaire pour la preuve de livraison');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoPreuve(result.assets[0].uri);
        Toast.show({ type: 'success', text1: 'Photo ajoutée', text2: 'La preuve de livraison a été capturée' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Impossible de prendre une photo' });
    }
  };

  const updateStatus = async (statut: string) => {
    try {
      setUpdating(true);
      let finalComment = commentaire || '';
      if (gpsCoords) {
        finalComment += ` [GPS: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}]`;
      }
      await updateColisStatus(colisId, statut, finalComment || undefined);
      Toast.show({ type: 'success', text1: 'Succès', text2: `Statut mis à jour: ${statut}` });
      setCommentaire('');
      setPhotoPreuve(null);
      await load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.response?.data?.message || 'Échec de mise à jour' });
    } finally {
      setUpdating(false);
    }
  };

  const confirmStatus = (statut: string, label: string) => {
    Alert.alert(
      'Confirmation',
      `Changer le statut vers "${label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => updateStatus(statut) }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!colis) {
    return (
      <View style={styles.center}>
        <Text>Colis introuvable</Text>
      </View>
    );
  }

  const terminal = ['livre', 'echec_livraison', 'annule'];
  const canUpdate = !terminal.includes(colis.statut);

  const availableActions = () => {
    const s = colis.statut;
    const actions: Array<{ statut: string; label: string; color: string; icon?: string }> = [];
    if (s === 'en_attente') {
      actions.push({ statut: 'pris_en_charge', label: '🧳 Prendre en charge', color: '#2196f3' });
    }
    if (s === 'pris_en_charge' || s === 'en_transit') {
      actions.push({ statut: 'en_livraison', label: '🚚 Démarrer la livraison', color: '#9c27b0' });
    }
    if (s === 'en_livraison') {
      actions.push({ statut: 'livre', label: '✅ Marquer comme livré', color: '#4caf50' });
      actions.push({ statut: 'echec_livraison', label: '❌ Signaler un échec', color: '#f44336' });
    }
    return actions;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Informations</Text>
        <InfoRow label="Référence" value={colis.reference || 'N/A'} />
        <InfoRow label="Statut" value={colis.statut} />
        <InfoRow label="Mode" value={colis.mode_livraison === 'domicile' ? '🏠 Domicile' : '🏪 Point relais'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Destinataire</Text>
        <InfoRow label="Nom" value={colis.destinataire?.nom || 'N/A'} />
        <InfoRow label="Téléphone" value={colis.destinataire?.telephone || 'N/A'} />
        {colis.adresse && <InfoRow label="Adresse" value={colis.adresse} />}
      </View>

      {colis.agence_relais && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Point Relais</Text>
          <InfoRow label="Nom" value={colis.agence_relais.nom} />
          <InfoRow label="Adresse" value={colis.agence_relais.adresse} />
        </View>
      )}

      {colis.expediteur && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Expéditeur</Text>
          <InfoRow label="Nom" value={colis.expediteur.nom} />
          <InfoRow label="Téléphone" value={colis.expediteur.telephone} />
        </View>
      )}

      {/* Historique */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕒 Historique</Text>
        {Array.isArray(colis.historique) && colis.historique.length > 0 ? (
          <View style={{ paddingVertical: theme.spacing.sm }}>
            {colis.historique.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((h: any, idx: number) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <Text>•</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...theme.typography.body }}>{h.description || h.statut}</Text>
                  {h.date ? <Text style={{ ...theme.typography.caption, color: '#9ca3af' }}>{formatDate(h.date)}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ ...theme.typography.caption, color: '#9ca3af' }}>Aucun historique</Text>
        )}
      </View>

      {canUpdate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Commentaire (optionnel)</Text>
          <TextInput
            placeholder="Ajoutez un commentaire..."
            multiline
            numberOfLines={3}
            value={commentaire}
            onChangeText={setCommentaire}
            style={styles.textArea}
          />
          {gpsCoords && (
            <Text style={{ ...theme.typography.caption, color: theme.colors.success, marginTop: theme.spacing.xs }}>
              📍 GPS capturé: {gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      )}

      {/* Preuve de livraison */}
      {canUpdate && colis.statut === 'en_livraison' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Preuve de livraison</Text>
          {photoPreuve ? (
            <>
              <Image source={{ uri: photoPreuve }} style={styles.photoPreuve} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoPreuve(null)}>
                <Text style={styles.removePhotoText}>🗑️ Supprimer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.takePhotoBtn} onPress={takePhoto}>
              <Text style={styles.takePhotoText}>📷 Prendre une photo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {canUpdate && (
        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>Actions</Text>
          {availableActions().map((a) => (
            <View key={a.statut} style={styles.actionButton}>
              <Button
                title={a.label}
                onPress={() => confirmStatus(a.statut, a.label.replace(/^.*?\s/, ''))}
                disabled={updating}
                color={a.color}
              />
            </View>
          ))}
        </View>
      )}

      {!canUpdate && (
        <View style={styles.finalStatus}>
          <Text style={styles.finalStatusText}>
            {colis.statut === 'livre' ? '✅ Colis livré' : '❌ Livraison échouée'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1976d2' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#666', width: 100 },
  infoValue: { fontSize: 14, color: '#333', flex: 1 },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    textAlignVertical: 'top'
  },
  photoPreuve: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm
  },
  removePhoto: {
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  removePhotoText: { color: '#fff', fontWeight: '600' },
  takePhotoBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  takePhotoText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  actions: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1976d2' },
  actionButton: { marginBottom: 12 },
  finalStatus: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  finalStatusText: { fontSize: 18, fontWeight: 'bold' }
});
