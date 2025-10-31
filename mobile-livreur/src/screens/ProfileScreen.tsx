import * as React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          <Text style={styles.row}>Nom: {user?.prenom ? `${user.prenom} ` : ''}{user?.nom}</Text>
          <Text style={styles.row}>Email: {user?.email}</Text>
          <Text style={styles.row}>Téléphone: {user?.telephone || 'N/A'}</Text>
          <Text style={styles.row}>Rôle: {user?.role}</Text>
        </View>
      ) : (
        <Text style={styles.helper}>Aucune information utilisateur.</Text>
      )}
      <View style={{ marginTop: 16 }}>
        <Button title="Se déconnecter" color="#b71c1c" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 16 },
  row: { marginBottom: 6 },
  helper: { color: '#666' }
});
