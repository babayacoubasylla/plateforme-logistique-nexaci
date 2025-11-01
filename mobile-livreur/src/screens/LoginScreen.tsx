import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '@/services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import Logo from '../components/ui/Logo';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const resp = await login(email, password);
      const token = resp?.data?.data?.token;
      const user = resp?.data?.data?.user;

      // Vérifier que c'est bien un livreur
      if (user?.role !== 'livreur') {
        Alert.alert('Erreur', 'Accès réservé aux livreurs uniquement');
        return;
      }

      if (!token) throw new Error('Token manquant');
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user || {}));
      navigation.replace('Dashboard');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Connexion échouée';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Logo size="large" showText={true} />
      <Text style={styles.title}>Connexion Livreur</Text>
      <Text style={styles.subtitle}>Accédez à votre tournée de livraison</Text>
      <TextInput
        placeholder="Email ou téléphone"
        autoCapitalize="none"
        keyboardType="default"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title={loading ? 'Connexion...' : 'Se connecter'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#1976d2' },
  subtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center', color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff'
  }
});
