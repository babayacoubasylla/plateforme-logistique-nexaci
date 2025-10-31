import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import Chip from '../components/ui/Chip';
import { theme } from '../theme';
import { getDocumentTypes, getAdministrations, createMandat } from '../services/mandatService';

export default function NewMandateScreen() {
  const [types, setTypes] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);

  // Informations document
  const [nomComplet, setNomComplet] = useState('');

  // Livraison
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');
  const [locLoading, setLocLoading] = useState(false);

  const [paiementMethode, setPaiementMethode] = useState<'orange_money' | 'mtn_money' | 'moov_money' | 'especes'>('orange_money');

  useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);
        const [tRes, aRes] = await Promise.all([
          getDocumentTypes(),
          getAdministrations()
        ]);
        setTypes(tRes?.data?.data?.documentTypes || []);
        setAdmins(aRes?.data?.data?.administrations || []);
      } catch (e) {
        // ignore
      } finally { setLoadingLists(false); }
    })();
  }, []);

  const pickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation contacts requise' });
        return;
      }
      const contact = await Contacts.presentContactPickerAsync();
      const phone = contact?.phoneNumbers?.[0]?.number?.replace(/\s+/g, '') || '';
      if (phone) setTelephone(phone);
      if (contact?.name && !nomComplet) setNomComplet(contact.name);
      Toast.show({ type: 'success', text1: 'Contact importé' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Import du contact impossible' });
    }
  };

  const useMyLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation de localisation requise' });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [g] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (g) {
        const adresseComplete = [g.street, g.district, g.subregion].filter(Boolean).join(', ');
        setAdresse(adresseComplete || g.name || '');
        setVille(g.city || g.region || '');
        Toast.show({ type: 'success', text1: 'Adresse récupérée' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Localisation indisponible' });
    } finally { setLocLoading(false); }
  };

  const onSubmit = async () => {
    if (!selectedType || !selectedAdmin || !nomComplet || !adresse || !ville || !telephone) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Remplissez toutes les informations obligatoires.' });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        type_document: selectedType,
        administration: selectedAdmin,
        informations_document: { nom_complet: nomComplet },
        livraison: { adresse, ville, telephone },
        paiement: { methode: paiementMethode }
      };
      await createMandat(payload);
      Toast.show({ type: 'success', text1: 'Mandat créé', text2: 'Votre demande a été enregistrée.' });
      setSelectedType(null);
      setSelectedAdmin(null);
      setNomComplet('');
      setAdresse('');
      setVille('');
      setTelephone('');
      setPaiementMethode('orange_money');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.response?.data?.message || e?.message || 'Échec de création' });
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau Mandat</Text>
      {loadingLists ? (
        <View style={{ paddingVertical: theme.spacing.md }}><ActivityIndicator /></View>
      ) : (
        <>
          <Text style={styles.label}>Type de document</Text>
          <FlatList
            data={types}
            keyExtractor={(it) => it._id}
            horizontal
            contentContainerStyle={{ columnGap: theme.spacing.sm }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.selectPill, selectedType === item._id && styles.selectPillSelected]}
                onPress={() => setSelectedType(item._id)}
              >
                <Text style={styles.pillText}>{item.nom}</Text>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.label}>Administration</Text>
          <FlatList
            data={admins}
            keyExtractor={(it) => it._id}
            horizontal
            contentContainerStyle={{ columnGap: theme.spacing.sm }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.selectPill, selectedAdmin === item._id && styles.selectPillSelected]}
                onPress={() => setSelectedAdmin(item._id)}
              >
                <Text style={styles.pillText}>{item.nom}</Text>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.label}>Nom complet</Text>
          <TextInput placeholder="ex: Kouassi Ama" value={nomComplet} onChangeText={setNomComplet} style={styles.input} />

          <Text style={styles.label}>Téléphone de livraison</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📞</Text>
            <TextInput placeholder="ex: +2250102030405" value={telephone} onChangeText={setTelephone} style={styles.inputFlex} keyboardType="phone-pad" />
          </View>
          <View style={styles.chipsRow}>
            <Chip label="+225" onPress={() => { const digits = telephone.replace(/\D+/g, ''); if (!telephone.startsWith('+225')) setTelephone(`+225${digits}`); }} />
            <Chip label="📒 Contacts" onPress={pickContact} />
          </View>

          <Text style={styles.label}>Adresse de livraison</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput placeholder="ex: Cocody, Riviera 2" value={adresse} onChangeText={setAdresse} style={styles.inputFlex} />
          </View>
          <View style={styles.chipsRow}>
            <Chip label={locLoading ? 'Chargement...' : '📍 Ma position'} onPress={useMyLocation} disabled={locLoading} />
          </View>

          <Text style={styles.label}>Ville</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🏙️</Text>
            <TextInput placeholder="ex: Abidjan" value={ville} onChangeText={setVille} style={styles.inputFlex} />
          </View>

          <Text style={styles.label}>Méthode de paiement</Text>
          <TouchableOpacity style={styles.input} onPress={() => {
            const order: any = ['orange_money','mtn_money','moov_money','especes'];
            const idx = order.indexOf(paiementMethode);
            setPaiementMethode(order[(idx+1)%order.length]);
          }}>
            <Text style={{ ...theme.typography.body }}> {paiementMethode.replace('_',' ').toUpperCase()} </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Créer le mandat'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  title: { ...theme.typography.title, marginBottom: theme.spacing.lg },
  label: { ...theme.typography.label, marginBottom: theme.spacing.xs, marginTop: theme.spacing.md },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, backgroundColor: '#fff', ...theme.typography.body },
  button: { backgroundColor: theme.colors.primary, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  selectPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  selectPillSelected: { borderColor: theme.colors.primary, backgroundColor: '#e3f2fd' },
  pillText: { ...theme.typography.body },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.sm, backgroundColor: '#fff', marginBottom: theme.spacing.md },
  inputIcon: { marginHorizontal: theme.spacing.xs, fontSize: 18 },
  inputFlex: { flex: 1, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xs, ...theme.typography.body },
  chipsRow: { flexDirection: 'row', columnGap: theme.spacing.sm, marginBottom: theme.spacing.sm }
});
