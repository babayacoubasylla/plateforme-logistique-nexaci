import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import MyShipmentsScreen from '@/screens/MyShipmentsScreen';
import NewShipmentScreen from '@/screens/NewShipmentScreen';
import TrackingScreen from '../screens/TrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyMandatesScreen from '../screens/MyMandatesScreen';
import NewMandateScreen from '../screens/NewMandateScreen';
import MandateTrackingScreen from '../screens/MandateTrackingScreen';
import MandateDetailScreen from '../screens/MandateDetailScreen';
import ColisDetailScreen from '../screens/ColisDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  MyShipments: undefined;
  NewShipment: undefined;
  Tracking: undefined;
  Profile: undefined;
  MyMandates: undefined;
  NewMandate: undefined;
  MandateTracking: undefined;
  MandateDetail: { id: string };
  ColisDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
        <Stack.Screen name="Register" getComponent={() => require('@/screens/RegisterScreen').default} options={{ title: 'Créer un compte' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tableau de bord' }} />
        <Stack.Screen name="MyShipments" component={MyShipmentsScreen} options={{ title: 'Mes Colis' }} />
        <Stack.Screen name="NewShipment" component={NewShipmentScreen} options={{ title: 'Nouveau Colis' }} />
        <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Suivre un Colis' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
  <Stack.Screen name="MyMandates" component={MyMandatesScreen} options={{ title: 'Mes Mandats' }} />
  <Stack.Screen name="NewMandate" component={NewMandateScreen} options={{ title: 'Nouveau Mandat' }} />
  <Stack.Screen name="MandateTracking" component={MandateTrackingScreen} options={{ title: 'Suivre un Mandat' }} />
  <Stack.Screen name="MandateDetail" component={MandateDetailScreen} options={{ title: 'Détail du Mandat' }} />
  <Stack.Screen name="ColisDetail" component={ColisDetailScreen} options={{ title: 'Détail du Colis' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
