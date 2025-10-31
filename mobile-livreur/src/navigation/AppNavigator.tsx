import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import AssignedColisScreen from '@/screens/AssignedColisScreen';
import ColisDetailScreen from '@/screens/ColisDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  AssignedColis: undefined;
  ColisDetail: { colisId: string };
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion Livreur' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tournée' }} />
        <Stack.Screen name="AssignedColis" component={AssignedColisScreen} options={{ title: 'Mes Livraisons' }} />
        <Stack.Screen name="ColisDetail" component={ColisDetailScreen} options={{ title: 'Détails Colis' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
