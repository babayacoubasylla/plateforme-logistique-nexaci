import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import Logo from '../components/ui/Logo';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    const names = fullName.trim().split(' ');
    const prenom = names.shift() || '';
    const nom = names.join(' ') || prenom;

    try {
      setLoading(true);
      const resp = await api.post('/api/auth/register', {
        nom,
        prenom,
        email: email.trim(),
        telephone: phone.trim(),
        password
      });

      const token = resp?.data?.data?.token || resp?.data?.token;
      const user = resp?.data?.data?.user || resp?.data?.user;
      if (!token || !user) throw new Error('Réponse invalide du serveur');

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      navigation.replace('Dashboard');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Inscription échouée';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Logo size="large" showText={true} />
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput placeholder="Nom complet" value={fullName} onChangeText={setFullName} style={styles.input} />
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={styles.input} />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Confirmer le mot de passe" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} />
      <Button title={loading ? 'Création...' : 'Créer un compte'} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="J'ai déjà un compte" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});
