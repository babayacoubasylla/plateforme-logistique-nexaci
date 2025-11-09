import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import Chip from '../components/ui/Chip';
import { theme } from '../theme';
import { getDocumentTypes, getAdministrations, createMandat } from '../services/mandatService';

export default function NewMandateScreen() {
  const [types, setTypes] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  
  // Sélections principales
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  
  // Informations du demandeur
  const [nomComplet, setNomComplet] = useState('');
  const [telephone, setTelephone] = useState('');
  
  // Lieu de la demande (NOUVEAU)
  const [villeDemande, setVilleDemande] = useState('');
  
  // Upload documents (NOUVEAU)
  const [photoDocument, setPhotoDocument] = useState<string | null>(null);
  
  // Mode de livraison (NOUVEAU)
  const [modeLivraison, setModeLivraison] = useState<'domicile' | 'relais'>('domicile');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [pointRelais, setPointRelais] = useState('');
  
  // Paiement
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
        console.log('Erreur chargement:', e);
      } finally { 
        setLoadingLists(false); 
      }
    })();
  }, []);

  // Upload photo document
  const pickDocument = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Toast.show({ 
          type: 'error', 
          text1: 'Permission requise', 
          text2: 'Autorisation accès photos nécessaire' 
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoDocument(result.assets[0].uri);
        Toast.show({ 
          type: 'success', 
          text1: 'Document ajouté', 
          text2: 'Photo uploadée avec succès' 
        });
      }
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Erreur', 
        text2: 'Impossible d\'uploader la photo' 
      });
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Autorisation localisation requise' });
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (geocode.length > 0) {
        const address = geocode[0];
        const fullAddress = [address.street, address.district, address.subregion].filter(Boolean).join(', ');
        setAdresseLivraison(fullAddress || address.name || '');
        Toast.show({ type: 'success', text1: 'Adresse récupérée' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Localisation indisponible' });
    }
  };

  const onSubmit = async () => {
    // Validation complète
    if (!selectedType || !nomComplet || !telephone || !villeDemande || !paiementMethode) {
      Toast.show({ 
        type: 'error', 
        text1: 'Champs requis', 
        text2: 'Veuillez remplir tous les champs obligatoires' 
      });
      return;
    }

    if (modeLivraison === 'domicile' && !adresseLivraison) {
      Toast.show({ 
        type: 'error', 
        text1: 'Adresse requise', 
        text2: 'Veuillez renseigner votre adresse de livraison' 
      });
      return;
    }

    if (modeLivraison === 'relais' && !pointRelais) {
      Toast.show({ 
        type: 'error', 
        text1: 'Point relais requis', 
        text2: 'Veuillez sélectionner un point relais' 
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type_document: selectedType,
        administration: selectedAdmin,
        ville_demande: villeDemande, // NOUVEAU
        informations_document: { 
          nom_complet: nomComplet 
        },
        livraison: { 
          mode: modeLivraison, // NOUVEAU
          adresse: modeLivraison === 'domicile' ? adresseLivraison : pointRelais,
          ville: 'Abidjan',
          telephone: telephone
        },
        paiement: { 
          methode: paiementMethode 
        },
        photo_document: photoDocument // NOUVEAU
      };
      
      await createMandat(payload);
      Toast.show({ 
        type: 'success', 
        text1: 'Mandat créé', 
        text2: 'Votre demande a été enregistrée avec succès' 
      });
      
      // Reset formulaire
      setSelectedType(null);
      setSelectedAdmin(null);
      setNomComplet('');
      setTelephone('');
      setVilleDemande('');
      setPhotoDocument(null);
      setAdresseLivraison('');
      setPointRelais('');
      setModeLivraison('domicile');
      setPaiementMethode('orange_money');
    } catch (e: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Erreur', 
        text2: e?.response?.data?.message || e?.message || 'Échec de création du mandat' 
      });
    } finally { 
      setLoading(false); 
    }
  };

  const pointsRelais = [
    'Station Shell Angré',
    'Pharmacie Plateau',
    'Supermarché Sococé',
    'Station Total Yopougon',
    'Marché de Cocody'
  ];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>🇨🇮 Nouveau Mandat Administratif</Text>
        
        {loadingLists ? (
          <View style={{ paddingVertical: theme.spacing.md }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ textAlign: 'center', marginTop: 8 }}>Chargement des documents...</Text>
          </View>
        ) : (
        <>
          {/* 1. TYPE DE DOCUMENT */}
          <Text style={styles.sectionTitle}>📋 Type de document</Text>
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
                <Text style={styles.pillPrice}>{item.frais_administratifs} FCFA</Text>
              </TouchableOpacity>
            )}
          />

          {/* 2. INFORMATIONS DEMANDEUR */}
          <Text style={styles.sectionTitle}>👤 Informations du demandeur</Text>
          
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            value={nomComplet}
            onChangeText={setNomComplet}
            placeholder="Ex: KOUASSI Yao Jean-Baptiste"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Numéro de téléphone *</Text>
          <TextInput
            style={styles.input}
            value={telephone}
            onChangeText={setTelephone}
            placeholder="+225 07 XX XX XX XX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />

          {/* 3. VILLE DE LA DEMANDE (NOUVEAU) */}
          <Text style={styles.sectionTitle}>🏢 Lieu de la demande</Text>
          
          <Text style={styles.label}>Ville où faire la demande *</Text>
          <Text style={styles.helpText}>
            (Votre ville de naissance ou de résidence pour le document)
          </Text>
          <TextInput
            style={styles.input}
            value={villeDemande}
            onChangeText={setVilleDemande}
            placeholder="Ex: Abidjan, Bouaké, Yamoussoukro, Man..."
            placeholderTextColor="#999"
          />

          {/* Administration (optionnel si types disponibles) */}
          {admins.length > 0 && (
            <>
              <Text style={styles.label}>Administration (optionnel)</Text>
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
            </>
          )}

          {/* 4. UPLOAD DOCUMENT (NOUVEAU) */}
          <Text style={styles.sectionTitle}>📸 Document justificatif</Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText}>
              {photoDocument ? '✅ Photo ajoutée' : '📷 Ajouter une photo'}
            </Text>
            <Text style={styles.uploadHelp}>
              (CNI, procuration, ancien document, etc.)
            </Text>
          </TouchableOpacity>

          {photoDocument && (
            <Image source={{ uri: photoDocument }} style={styles.documentPreview} />
          )}

          {/* 5. MODE DE LIVRAISON (NOUVEAU) */}
          <Text style={styles.sectionTitle}>🚚 Mode de livraison</Text>
          
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[styles.radioOption, modeLivraison === 'domicile' && styles.radioOptionSelected]}
              onPress={() => setModeLivraison('domicile')}
            >
              <Text style={styles.radioText}>🏠 Livraison à domicile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radioOption, modeLivraison === 'relais' && styles.radioOptionSelected]}
              onPress={() => setModeLivraison('relais')}
            >
              <Text style={styles.radioText}>📍 Point relais</Text>
            </TouchableOpacity>
          </View>

          {/* Adresse de livraison */}
          {modeLivraison === 'domicile' && (
            <>
              <Text style={styles.label}>Adresse de livraison *</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={adresseLivraison}
                onChangeText={setAdresseLivraison}
                placeholder="Ex: Cocody, Angré 8ème tranche, Villa 123"
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                <Text style={styles.locationButtonText}>📍 Utiliser ma position</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Point relais */}
          {modeLivraison === 'relais' && (
            <>
              <Text style={styles.label}>Choisir un point relais *</Text>
              <FlatList
                data={pointsRelais}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.relaisOption, pointRelais === item && styles.relaisOptionSelected]}
                    onPress={() => setPointRelais(item)}
                  >
                    <Text style={styles.relaisText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* 6. MODE DE PAIEMENT */}
          <Text style={styles.sectionTitle}>💰 Mode de paiement</Text>
          
          <View style={styles.paymentGrid}>
            {[
              { id: 'orange_money', name: 'Orange Money', emoji: '🟠' },
              { id: 'mtn_money', name: 'MTN MoMo', emoji: '🟡' },
              { id: 'moov_money', name: 'Moov Money', emoji: '🔵' },
              { id: 'especes', name: 'Espèces', emoji: '💰' }
            ].map((method) => (
              <TouchableOpacity 
                key={method.id}
                style={[styles.paymentOption, paiementMethode === method.id && styles.paymentOptionSelected]}
                onPress={() => setPaiementMethode(method.id as any)}
              >
                <Text style={styles.paymentEmoji}>{method.emoji}</Text>
                <Text style={styles.paymentText}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BOUTON DE VALIDATION */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Créer le mandat</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            🇨🇮 Service officiel de mandats administratifs Côte d'Ivoire
          </Text>
        </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 120 },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1f2937',
    marginBottom: theme.spacing.lg,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#374151',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: theme.spacing.sm
  },
  selectPill: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    minWidth: 120
  },
  selectPillSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316'
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center'
  },
  pillPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  uploadButton: {
    backgroundColor: 'white',
    padding: theme.spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  uploadHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  documentPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: theme.spacing.sm
  },
  radioGroup: {
    gap: theme.spacing.sm
  },
  radioOption: {
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db'
  },
  radioOptionSelected: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b'
  },
  radioText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151'
  },
  locationButton: {
    backgroundColor: '#3b82f6',
    padding: theme.spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: theme.spacing.sm
  },
  locationButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  relaisOption: {
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: theme.spacing.sm
  },
  relaisOptionSelected: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b'
  },
  relaisText: {
    fontSize: 16,
    color: '#374151'
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  paymentOption: {
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    width: '47%'
  },
  paymentOptionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981'
  },
  paymentEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  submitButton: {
    backgroundColor: '#f97316',
    padding: theme.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af'
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginTop: theme.spacing.md
  }
});