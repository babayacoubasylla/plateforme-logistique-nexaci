import * as React from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { getLivreurStats } from '../services/stats';
import { theme } from '../theme';
import { formatDate } from '../utils/dateFormatter';
import StatusBadge from '../components/ui/StatusBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const [userName, setUserName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.nom || 'Livreur');
      }
    } catch (e) {
      // noop
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const resp = await getLivreurStats();
      setStats(resp?.data?.data?.stats || null);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Bonjour {userName} 👋</Text>
      <Text style={styles.subtitle}>Gérez vos livraisons du jour et suivez vos performances.</Text>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator /></View>
      ) : (
        <>
          <Text style={styles.section}>Vos performances</Text>
          <View style={styles.row}>
            <PerfCard label="Missions du jour" value={stats?.missions_du_jour?.total ?? 0} color={theme.colors.primary} />
            <PerfCard label="Taux livraison" value={`${stats?.performance?.taux_livraison ?? 0}%`} color={theme.colors.success} />
          </View>
          <View style={styles.row}>
            <PerfCard label="Revenus mensuels" value={`${(stats?.performance?.revenus_mensuels ?? 0).toLocaleString?.()} XOF`} color={theme.colors.purple} />
            <PerfCard label="Efficacité" value={`${stats?.performance?.efficacite ?? 0}%`} color={theme.colors.warning} />
          </View>

          <Text style={styles.section}>Résumé des livraisons</Text>
          <View style={styles.row}>
            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>Colis</Text>
              <Text style={styles.blockText}>Total: {stats?.colis?.total ?? 0}</Text>
              <Text style={styles.blockText}>Livrés: {stats?.colis?.livres ?? 0}</Text>
              <Text style={styles.blockText}>En cours: {stats?.colis?.en_cours ?? 0}</Text>
              <Text style={styles.blockText}>Revenus: {(stats?.colis?.revenus_total ?? 0).toLocaleString?.()} XOF</Text>
            </View>
            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>Mandats</Text>
              <Text style={styles.blockText}>Total: {stats?.mandats?.total ?? 0}</Text>
              <Text style={styles.blockText}>Livrés: {stats?.mandats?.livres ?? 0}</Text>
              <Text style={styles.blockText}>En cours: {stats?.mandats?.en_cours ?? 0}</Text>
              <Text style={styles.blockText}>Revenus: {(stats?.mandats?.revenus_total ?? 0).toLocaleString?.()} XOF</Text>
            </View>
          </View>

          <Text style={styles.section}>Missions du jour</Text>
          <Text style={styles.helper}>Touchez un colis pour voir le détail et mettre à jour le statut.</Text>
          <View>
            {(stats?.missions_du_jour?.colis || []).length === 0 ? (
              <Text style={styles.empty}>✅ Aucune mission colis aujourd'hui.</Text>
            ) : (
              (stats?.missions_du_jour?.colis || []).map((item: any) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.item}
                  onPress={() => navigation.navigate('ColisDetail', { colisId: item._id })}
                >
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle}>{item.reference}</Text>
                    <StatusBadge status={item.statut} />
                  </View>
                  {item.destinataire?.nom && <Text style={styles.itemInfo}>👤 {item.destinataire.nom}</Text>}
                  {item.createdAt && <Text style={styles.itemDate}>🕒 {formatDate(item.createdAt)}</Text>}
                </TouchableOpacity>
              ))
            )}
          </View>
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Mes Livraisons</Text>
        <Text style={styles.cardSubtitle}>Voir tous les colis assignés</Text>
        <Button title="Accéder" onPress={() => navigation.navigate('AssignedColis')} color={theme.colors.primary} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🕒 Mon Historique</Text>
        <Text style={styles.cardSubtitle}>Livraisons terminées</Text>
        <Button title="Voir" onPress={() => navigation.navigate('History')} color={theme.colors.info} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Mon Profil</Text>
        <Text style={styles.cardSubtitle}>Informations du compte</Text>
        <Button title="Ouvrir" onPress={() => navigation.navigate('Profile')} color={theme.colors.purple} />
      </View>

      <View style={styles.logout}>
        <Button title="Se déconnecter" color={theme.colors.danger} onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, backgroundColor: '#f9fafb', paddingBottom: theme.spacing.xxl },
  welcome: { ...theme.typography.title, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  subtitle: { ...theme.typography.body, color: '#6b7280', marginBottom: theme.spacing.xl },
  loader: { paddingVertical: theme.spacing.lg },
  section: { ...theme.typography.subtitle, marginBottom: theme.spacing.sm, marginTop: theme.spacing.md },
  row: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  perfCard: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: '#fff', ...theme.shadows.small },
  perfLabel: { ...theme.typography.caption, color: '#6b7280' },
  perfValue: { ...theme.typography.subtitle, marginTop: theme.spacing.xs },
  blockCard: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  blockTitle: { ...theme.typography.label, marginBottom: theme.spacing.sm },
  blockText: { ...theme.typography.body, marginBottom: theme.spacing.xs },
  helper: { ...theme.typography.caption, color: '#6b7280', marginBottom: theme.spacing.sm },
  item: { padding: theme.spacing.md, backgroundColor: '#fff', borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, ...theme.shadows.small },
  itemTitle: { ...theme.typography.label },
  itemInfo: { ...theme.typography.body, color: '#6b7280', marginTop: theme.spacing.xs },
  itemDate: { ...theme.typography.caption, color: '#9ca3af', marginTop: theme.spacing.xs },
  empty: { ...theme.typography.body, color: '#6b7280', fontStyle: 'italic', paddingVertical: theme.spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
    ...theme.shadows.medium
  },
  cardTitle: { ...theme.typography.subtitle, marginBottom: theme.spacing.xs },
  cardSubtitle: { ...theme.typography.body, color: '#6b7280', marginBottom: theme.spacing.md },
  logout: { marginTop: theme.spacing.lg }
});

function PerfCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={[styles.perfCard, { borderLeftWidth: 4, borderLeftColor: color }]}> 
      <Text style={styles.perfLabel}>{label}</Text>
      <Text style={[styles.perfValue, { color }]}>{value}</Text>
    </View>
  );
}
