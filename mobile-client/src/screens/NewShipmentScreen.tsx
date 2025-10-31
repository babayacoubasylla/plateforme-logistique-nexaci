import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch, ActivityIndicator, FlatList, TouchableOpacity, Platform, Image, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { createColis, uploadColisPhoto } from '@/services/api';
import { getAgences } from '@/services/agences';
import Chip from '../components/ui/Chip';
import { theme } from '../theme';

export default function NewShipmentScreen() {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [poids, setPoids] = useState('1');
  const [paiementMethode, setPaiementMethode] = useState('cash');
  const [pointRelais, setPointRelais] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<any[]>([]);
  const [agencesLoading, setAgencesLoading] = useState(false);
  const [agenceId, setAgenceId] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (pointRelais) {
      loadAgences();
    }
  }, [pointRelais]);

  const loadAgences = async () => {
    try {
      setAgencesLoading(true);
      const resp = await getAgences();
      setAgences(resp?.data?.data?.agences || resp?.data?.agences || []);
    } catch (e) {
      // ignore
    } finally {
      setAgencesLoading(false);
    }
  };

  const pickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation accès aux contacts requise' });
        return;
      }
      const contact = await Contacts.presentContactPickerAsync();
      if (contact?.phoneNumbers && contact.phoneNumbers.length > 0) {
        const phone = contact.phoneNumbers[0].number?.replace(/\s+/g, '') || '';
        setTelephone(phone);
        if (contact.name) {
          setNom(contact.name);
        }
        Toast.show({ type: 'success', text1: 'Contact importé', text2: `${contact.name || 'Contact'} ajouté` });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible importer le contact' });
    }
  };

  const useMyLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation de localisation requise' });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      if (geocode) {
        const adresseComplete = [geocode.street, geocode.district, geocode.subregion].filter(Boolean).join(', ');
        setAdresse(adresseComplete || geocode.name || 'Adresse non trouvée');
        setVille(geocode.city || geocode.region || '');
        Toast.show({ type: 'success', text1: 'Position récupérée', text2: 'Adresse remplie automatiquement' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de récupérer la position' });
    } finally {
      setLocationLoading(false);
    }
  };

  const pasteLocationLink = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const googleMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const appleMatch = text.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      
      if (googleMatch || appleMatch) {
        const [, lat, lng] = googleMatch || appleMatch || [];
        if (lat && lng) {
          const [geocode] = await Location.reverseGeocodeAsync({
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          });
          if (geocode) {
            const adresseComplete = [geocode.street, geocode.district, geocode.subregion].filter(Boolean).join(', ');
            setAdresse(adresseComplete || geocode.name || 'Adresse trouvée');
            setVille(geocode.city || geocode.region || '');
            Toast.show({ type: 'success', text1: 'Lien intégré', text2: 'Adresse extraite du lien de localisation' });
            return;
          }
        }
      }
      Toast.show({ type: 'error', text1: 'Lien invalide', text2: 'Copiez un lien Google Maps ou Apple Maps' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de lire le presse-papier' });
    }
  };

  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation accès photos requise' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        Toast.show({ type: 'success', text1: 'Photo ajoutée', text2: 'Photo du colis enregistrée' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sélectionner la photo' });
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation accès caméra requise' });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        Toast.show({ type: 'success', text1: 'Photo prise', text2: 'Photo du colis enregistrée' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de prendre la photo' });
    }
  };

  const onSubmit = async () => {
    if (!nom || !telephone) {
      Alert.alert('Champs requis', 'Nom et téléphone du destinataire sont requis');
      return;
    }
    // Validation téléphone simple CI (+225 + 10 chiffres)
    const tel = telephone.replace(/\s+/g, '');
    if (!/^(\+225)?\d{10}$/.test(tel)) {
      Toast.show({ type: 'error', text1: 'Téléphone invalide', text2: 'Format attendu: +225XXXXXXXXXX' });
      return;
    }
    if (pointRelais) {
      if (!agenceId) {
        Alert.alert('Agence requise', 'Veuillez choisir un point relais.');
        return;
      }
    } else {
      if (!adresse || !ville) {
        Alert.alert('Adresse requise', 'Adresse et ville sont requises pour la livraison à domicile.');
        return;
      }
    }

    try {
      setLoading(true);
      const payload: any = {
        typeLivraison: pointRelais ? 'point_relais' : 'domicile',
        destinataire: pointRelais
          ? { nom, telephone }
          : { nom, telephone, adresse, ville },
        details_colis: { poids: Math.max(1, Number(poids) || 1) },
        paiement: { methode: paiementMethode }
      };

      if (pointRelais && agenceId) {
        payload.agenceId = agenceId;
      }

      const resp = await createColis(payload);
      const created = resp?.data?.data?.colis || resp?.data?.colis;
      // Upload photo si présente
      try {
        if (created?._id && photoUri) {
          await uploadColisPhoto(created._id, { uri: photoUri });
        }
      } catch {}
      Toast.show({ type: 'success', text1: 'Colis créé', text2: 'Votre envoi a été enregistré.' });
      setNom('');
      setTelephone('');
      setAdresse('');
      setVille('');
      setPoids('1');
      setPaiementMethode('cash');
      setAgenceId(null);
      setPointRelais(false);
      setPhotoUri(null);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.response?.data?.message || e?.message || 'Échec de création' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau Colis</Text>
      <Text style={styles.helper}>Renseignez les coordonnées du destinataire. Choisissez « point relais » si vous souhaitez déposer ou récupérer en agence.</Text>
      <View style={styles.row}>
        <Text>Livraison en point relais</Text>
        <Switch value={pointRelais} onValueChange={setPointRelais} />
      </View>
      <Text style={styles.label}>Nom du destinataire</Text>
      <TextInput placeholder="ex: Kouadio Jean" value={nom} onChangeText={setNom} style={styles.input} autoCapitalize="words" />
      <Text style={styles.label}>Téléphone du destinataire</Text>
      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>📞</Text>
        <TextInput placeholder="ex: +2250102030405" value={telephone} onChangeText={setTelephone} style={styles.inputFlex} keyboardType="phone-pad" />
      </View>
      <View style={styles.chipsRow}>
        <Chip
          label="+225"
          onPress={() => {
            const digits = telephone.replace(/\D+/g, '');
            if (!telephone.startsWith('+225')) {
              setTelephone(`+225${digits}`);
            }
          }}
        />
        <Chip
          label="📒 Contacts"
          onPress={pickContact}
        />
      </View>
      <Text style={styles.hint}>Ce numéro recevra les notifications WhatsApp</Text>
      {!pointRelais && (
        <>
          <Text style={styles.label}>Adresse complète</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput placeholder="ex: Cocody, 2 Plateaux, rue 12" value={adresse} onChangeText={setAdresse} style={styles.inputFlex} />
          </View>
          <View style={styles.chipsRow}>
            <Chip
              label={locationLoading ? 'Chargement...' : '📍 Ma position'}
              onPress={useMyLocation}
              disabled={locationLoading}
            />
            <Chip
              label="🔗 Coller lien"
              onPress={pasteLocationLink}
            />
          </View>
          <Text style={styles.label}>Ville</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🏙️</Text>
            <TextInput placeholder="ex: Abidjan" value={ville} onChangeText={setVille} style={styles.inputFlex} />
          </View>
        </>
      )}

      <Text style={styles.label}>Poids (kg)</Text>
      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>📦</Text>
        <TextInput placeholder="ex: 1, 2, 5" value={poids} onChangeText={setPoids} style={styles.inputFlex} keyboardType="numeric" />
      </View>
      <Text style={styles.label}>Méthode de paiement</Text>
      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>💵</Text>
        <TextInput placeholder="ex: cash" value={paiementMethode} onChangeText={setPaiementMethode} style={styles.inputFlex} />
      </View>

      {/* Photo du colis */}
      <Text style={styles.label}>Photo du colis (optionnel)</Text>
      <View style={styles.chipsRow}>
        <Chip
          label={photoUri ? '📸 Reprendre' : '📸 Prendre photo'}
          onPress={takePhoto}
        />
        <Chip
          label={photoUri ? '🖼️ Remplacer' : '🖼️ Choisir photo'}
          onPress={pickPhoto}
        />
        {photoUri && (
          <Chip
            label="🗑️ Supprimer photo"
            onPress={() => setPhotoUri(null)}
          />
        )}
      </View>
      {photoUri && (
        <Image 
          source={{ uri: photoUri }} 
          style={styles.photoPreview}
        />
      )}

      {pointRelais && (
        <View style={styles.agencesBox}>
          <Text style={styles.subtitle}>Choisir un point relais</Text>
          {agencesLoading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={agences}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={<Text style={styles.empty}>Aucune agence trouvée.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.agenceItem, agenceId === item._id && styles.agenceItemSelected]}
                  onPress={() => setAgenceId(item._id)}
                >
                  <Text style={styles.agenceTitle}>{item.nom}</Text>
                  <Text style={styles.agenceAddress}>{item?.adresse} {item?.ville ? `- ${item.ville}` : ''}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <Text style={styles.hint}>Touchez une agence pour la sélectionner</Text>
          {agenceId && <Text style={styles.selectedInfo}>Sélectionné: {agences.find(a => a._id === agenceId)?.nom}</Text>}
        </View>
      )}
      <Button title={loading ? 'Envoi...' : 'Créer le colis'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  title: { ...theme.typography.title, marginBottom: theme.spacing.lg },
  helper: { ...theme.typography.caption, marginBottom: theme.spacing.sm },
  label: { ...theme.typography.label, marginBottom: theme.spacing.xs, marginTop: theme.spacing.xs },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.md, 
    marginBottom: theme.spacing.md, 
    backgroundColor: '#fff',
    ...theme.typography.body
  },
  hint: { ...theme.typography.caption, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  agencesBox: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.sm, 
    marginBottom: theme.spacing.md,
    backgroundColor: '#fff'
  },
  subtitle: { ...theme.typography.subtitle, marginBottom: theme.spacing.sm, fontSize: 16 },
  agenceItem: { 
    padding: theme.spacing.md, 
    borderRadius: theme.borderRadius.sm, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    marginBottom: theme.spacing.sm,
    backgroundColor: '#fff'
  },
  agenceItemSelected: { borderColor: theme.colors.primary, backgroundColor: '#e3f2fd' },
  agenceTitle: { fontWeight: 'bold', fontSize: 14 },
  agenceAddress: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  selectedInfo: { marginTop: theme.spacing.xs, color: theme.colors.primary, ...theme.typography.caption },
  empty: { color: '#6b7280', fontStyle: 'italic', paddingVertical: theme.spacing.sm, ...theme.typography.caption },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: theme.borderRadius.md, 
    paddingHorizontal: theme.spacing.sm, 
    backgroundColor: '#fff', 
    marginBottom: theme.spacing.md 
  },
  inputIcon: { marginHorizontal: theme.spacing.xs, fontSize: 18 },
  inputFlex: { flex: 1, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xs, ...theme.typography.body },
  chipsRow: { flexDirection: 'row', columnGap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  photoPreview: { 
    width: '100%', 
    height: 200, 
    borderRadius: theme.borderRadius.md, 
    marginTop: theme.spacing.sm,
    resizeMode: 'cover'
  }
});
