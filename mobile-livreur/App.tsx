import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import AppNavigator from '@/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  try {
    return (
      <>
        <StatusBar style="auto" />
        <AppNavigator />
        <Toast />
      </>
    );
  } catch (error) {
    console.error('App Error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Erreur de chargement</Text>
        <Text style={{ fontSize: 12, marginTop: 10 }}>{String(error)}</Text>
      </View>
    );
  }
}
