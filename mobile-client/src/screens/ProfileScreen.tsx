import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export default function ProfileScreen() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const str = await AsyncStorage.getItem('user');
      if (str) setUser(JSON.parse(str));
    })();
  }, []);

  const logout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>
      {user ? (
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>👤 Nom:</Text>
            <Text style={styles.value}>{user?.prenom ? `${user.prenom} ` : ''}{user?.nom}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>📧 Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>📞 Téléphone:</Text>
            <Text style={styles.value}>{user?.telephone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>🎭 Rôle:</Text>
            <Text style={styles.value}>{user?.role}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.helper}>Aucune information utilisateur.</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>
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
    marginBottom: theme.spacing.lg 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: theme.borderRadius.lg, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    padding: theme.spacing.lg,
    ...theme.shadows.medium
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  label: {
    ...theme.typography.label,
    fontSize: 15
  },
  value: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#374151'
  },
  helper: { 
    ...theme.typography.caption 
  },
  logoutButton: {
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
