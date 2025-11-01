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
      if (!token || !user) {
        throw new Error('Réponse invalide du serveur');
      }
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
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
      <Text style={styles.title}>Connexion</Text>
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
      <View style={{ height: 12 }} />
      <Button title="Créer un compte" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  }
});
