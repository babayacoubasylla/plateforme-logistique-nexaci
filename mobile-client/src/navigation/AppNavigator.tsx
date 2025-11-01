import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  MainTabs: undefined;
  Dashboard: undefined; // conservé pour routes internes si besoin
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
        tabBarGap: 8,
        tabBarScrollEnabled: true,
      }}
    >
      <TopTabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={16} color={color} />
              <Text style={{ color, fontWeight: '600' }}>Accueil</Text>
            </View>
          ),
        }}
      />
      <TopTabs.Screen
        name="MyShipments"
        component={MyShipmentsScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name={focused ? 'cube' : 'cube-outline'} size={16} color={color} />
              <Text style={{ color, fontWeight: '600' }}>Colis</Text>
            </View>
          ),
        }}
      />
      <TopTabs.Screen
        name="MyMandates"
        component={MyMandatesScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name={focused ? 'file-document' : 'file-document-outline'} size={16} color={color} />
              <Text style={{ color, fontWeight: '600' }}>Mandats</Text>
            </View>
          ),
        }}
      />
      <TopTabs.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name={focused ? 'magnify-scan' : 'magnify'} size={16} color={color} />
              <Text style={{ color, fontWeight: '600' }}>Suivi</Text>
            </View>
          ),
        }}
      />
      <TopTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={16} color={color} />
              <Text style={{ color, fontWeight: '600' }}>Profil</Text>
            </View>
          ),
        }}
      />
    </TopTabs.Navigator>
  );
}

export default function AppNavigator() {
  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#1976d2', background: '#ffffff' },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
        <Stack.Screen name="Register" getComponent={() => require('@/screens/RegisterScreen').default} options={{ title: 'Créer un compte' }} />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTopTabs} 
          options={({ navigation }) => ({ 
            title: 'NexaCI',
            headerShown: true,
            headerStyle: { backgroundColor: '#1976d2' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            headerRight: () => (
              <Text 
                onPress={() => navigation.navigate('NewShipment')} 
                style={{ color: '#fff', fontWeight: '600' }}
                accessibilityLabel="Créer un colis"
              >+ Nouveau</Text>
            ),
          })}
        />
        {/* écrans secondaires accessibles via boutons */}
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
