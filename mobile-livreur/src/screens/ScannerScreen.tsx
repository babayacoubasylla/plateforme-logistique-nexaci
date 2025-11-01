import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

type Props = {
  navigation: any;
};

export default function ScannerScreen({ navigation }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      'Code scanné',
      `Type: ${type}\nDonnées: ${data}`,
      [
        { text: 'Scanner à nouveau', onPress: () => setScanned(false) },
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Demande de permission caméra...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#9ca3af" />
        <Text style={styles.title}>Accès caméra refusé</Text>
        <Text style={styles.subtitle}>Autorisez l'accès à la caméra dans les paramètres pour scanner des codes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.instructionText}>
            Placez le QR code ou code-barres dans le cadre
          </Text>
          {scanned && (
            <TouchableOpacity 
              style={styles.rescanButton} 
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  title: { ...theme.typography.title, marginTop: theme.spacing.lg, textAlign: 'center' },
  subtitle: { ...theme.typography.body, color: '#6b7280', marginTop: theme.spacing.sm, textAlign: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  middleRow: { flexDirection: 'row' },
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanArea: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#fff' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  bottomOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg
  },
  instructionText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  rescanButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm
  },
  rescanText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
