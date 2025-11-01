import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginScreen from '@/screens/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import AssignedColisScreen from '@/screens/AssignedColisScreen';
import ColisDetailScreen from '@/screens/ColisDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScannerScreen from '../screens/ScannerScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  AssignedColis: undefined;
  ColisDetail: { colisId: string };
  History: undefined;
  Profile: undefined;
  Scanner: undefined;
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
        tabBarStyle: { 
          backgroundColor: '#1976d2',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarIndicatorStyle: { 
          backgroundColor: '#fff', 
          height: 3, 
          borderRadius: 3,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 13 },
        tabBarScrollEnabled: true,
        tabBarPressColor: 'rgba(255,255,255,0.2)',
        tabBarPressOpacity: 0.8,
      }}
    >
      <TopTabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: ({ color, focused }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={focused ? 'route' : 'map-marker-path'} size={16} color={color} />
          <Text style={{ color, fontWeight: '600' }}>Tournée</Text>
        </View>
      ) }} />
      <TopTabs.Screen name="AssignedColis" component={AssignedColisScreen} options={{ tabBarLabel: ({ color, focused }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={focused ? 'truck-delivery' : 'truck-delivery-outline'} size={16} color={color} />
          <Text style={{ color, fontWeight: '600' }}>Mes livraisons</Text>
        </View>
      ) }} />
      <TopTabs.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: ({ color, focused }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={focused ? 'history' : 'timeline-clock-outline'} size={16} color={color} />
          <Text style={{ color, fontWeight: '600' }}>Historique</Text>
        </View>
      ) }} />
      <TopTabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: ({ color, focused }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={16} color={color} />
          <Text style={{ color, fontWeight: '600' }}>Profil</Text>
        </View>
      ) }} />
    </TopTabs.Navigator>
  );
}

export default function AppNavigator() {
  const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#1976d2', background: '#ffffff' } };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion Livreur' }} />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTopTabs}
          options={({ navigation }) => ({
            title: 'NexaCI Livreur',
            headerShown: true,
            headerStyle: { backgroundColor: '#1976d2' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Text 
                  onPress={() => navigation.navigate('Scanner')}
                  style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}
                  accessibilityLabel="Scanner un code"
                >📷 Scanner</Text>
                <Text 
                  onPress={() => navigation.navigate('AssignedColis')}
                  style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}
                  accessibilityLabel="Voir mes livraisons"
                >Livraisons</Text>
              </View>
            ),
          })}
        />
        {/* Détails */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tournée' }} />
        <Stack.Screen name="AssignedColis" component={AssignedColisScreen} options={{ title: 'Mes Livraisons' }} />
        <Stack.Screen name="ColisDetail" component={ColisDetailScreen} options={{ title: 'Détails Colis' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
        <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scanner Code', headerShown: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
