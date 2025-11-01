import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoginScreen from '@/screens/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import AssignedColisScreen from '@/screens/AssignedColisScreen';
import ColisDetailScreen from '@/screens/ColisDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  AssignedColis: undefined;
  ColisDetail: { colisId: string };
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const TopTabs = createMaterialTopTabNavigator();

function MainTopTabs() {
  return (
    <TopTabs.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        tabBarStyle: { backgroundColor: '#1976d2' },
        tabBarIndicatorStyle: { backgroundColor: '#fff', height: 3, borderRadius: 3 },
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarScrollEnabled: true,
      }}
    >
      <TopTabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Tournée' }} />
      <TopTabs.Screen name="AssignedColis" component={AssignedColisScreen} options={{ tabBarLabel: 'Mes livraisons' }} />
      <TopTabs.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Historique' }} />
      <TopTabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </TopTabs.Navigator>
  );
}

export default function AppNavigator() {
  const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#1976d2', background: '#ffffff' } };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion Livreur' }} />
        <Stack.Screen name="MainTabs" component={MainTopTabs} options={{ headerShown: false }} />
        {/* Détails */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tournée' }} />
        <Stack.Screen name="AssignedColis" component={AssignedColisScreen} options={{ title: 'Mes Livraisons' }} />
        <Stack.Screen name="ColisDetail" component={ColisDetailScreen} options={{ title: 'Détails Colis' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
