import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getClientStats } from '../services/stats';
import { theme } from '../theme';
import { formatDate } from '../utils/dateFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getClientStats();
      setStats(resp?.data?.data?.stats || null);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Tableau de bord</Text>

        <Text style={styles.helperText}>Consultez vos statistiques et vos dernières activités. Utilisez les actions rapides en bas pour créer ou suivre vos envois.</Text>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
          {/* Résumé identique au web */}
          <Text style={styles.section}>Vos statistiques</Text>
          <View style={styles.cardsRow}>
            <StatCard label="Total commandes" value={stats?.resume?.total_commandes ?? 0} color="#1976d2" />
            <StatCard label="Total dépensé" value={`XOF ${(stats?.resume?.total_depenses ?? 0).toLocaleString?.() || stats?.resume?.total_depenses || 0}`} color="#9c27b0" />
          </View>
          <View style={styles.cardsRow}>
            <StatCard label="En cours" value={stats?.resume?.en_cours ?? 0} color="#ff9800" />
            <StatCard label="Taux de succès" value={`${stats?.resume?.taux_success ?? 0}%`} color="#4caf50" />
          </View>

          {/* Résumé Colis / Mandats */}
          <Text style={styles.section}>Résumé</Text>
          <View style={styles.cardsRow}>
            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>Colis</Text>
              <Text>Total: {stats?.colis?.total ?? 0}</Text>
              <Text>En attente: {stats?.colis?.en_attente ?? 0}</Text>
              <Text>En cours: {stats?.colis?.en_cours ?? 0}</Text>
              <Text>Livrés: {stats?.colis?.livres ?? 0}</Text>
            </View>
            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>Mandats</Text>
              <Text>Total: {stats?.mandats?.total ?? 0}</Text>
              <Text>En attente: {stats?.mandats?.en_attente ?? 0}</Text>
              <Text>En cours: {stats?.mandats?.en_cours ?? 0}</Text>
              <Text>Complétés: {stats?.mandats?.completes ?? 0}</Text>
            </View>
          </View>

          {/* Activité récente */}
          <Text style={styles.section}>Derniers colis</Text>
          {(stats?.derniers_colis || []).length === 0 ? (
            <EmptyState 
              icon="📦"
              title="Aucun colis récent"
              subtitle="Créez votre premier colis pour commencer à suivre vos envois."
              actionLabel="Créer un colis"
              onAction={() => navigation.navigate('NewShipment')}
            />
          ) : (
            <FlatList
              nestedScrollEnabled
              data={stats?.derniers_colis || []}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle}>{item.reference}</Text>
                    <StatusBadge status={item.statut} />
                  </View>
                  {item.createdAt ? (
                    <Text style={styles.dateText}>🕒 {formatDate(item.createdAt)}</Text>
                  ) : null}
                </View>
              )}
            />
          )}

          <Text style={styles.section}>Derniers mandats</Text>
          {(stats?.derniers_mandats || []).length === 0 ? (
            <EmptyState 
              icon="📄"
              title="Aucun mandat récent"
              subtitle="Les mandats apparaîtront ici une fois créés."
            />
          ) : (
            <FlatList
              nestedScrollEnabled
              data={stats?.derniers_mandats || []}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle}>{item.reference || item._id}</Text>
                    <StatusBadge status={item.statut} />
                  </View>
                  {item.createdAt ? (
                    <Text style={styles.dateText}>🕒 {formatDate(item.createdAt)}</Text>
                  ) : null}
                </View>
              )}
            />
          )}
        </>
        )}

        {/* Actions rapides */}
        <Text style={styles.section}>Actions rapides</Text>
        <Text style={styles.helperText}>Créez un envoi ou un mandat, consultez vos historiques ou suivez par référence.</Text>
        <View style={styles.actions}> 
          <Button title="Envoyer un colis" onPress={() => navigation.navigate('NewShipment')} />
        </View>
        <View style={styles.actions}> 
          <Button title="Historique (Mes Colis)" onPress={() => navigation.navigate('MyShipments')} />
        </View>
        <View style={styles.actions}> 
          <Button title="Suivre un colis" onPress={() => navigation.navigate('Tracking')} />
        </View>
        <View style={styles.actions}> 
          <Button title="Nouveau mandat" onPress={() => navigation.navigate('NewMandate')} />
        </View>
        <View style={styles.actions}> 
          <Button title="Historique (Mes Mandats)" onPress={() => navigation.navigate('MyMandates')} />
        </View>
        <View style={styles.actions}> 
          <Button title="Suivre un mandat" onPress={() => navigation.navigate('MandateTracking')} />
        </View>
        <View style={styles.actions}> 
          <Button title="Mon Profil" onPress={() => navigation.navigate('Profile')} />
        </View>
        <View style={styles.logout}>
          <Button title="Se déconnecter" color="#b71c1c" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  scrollContent: { paddingBottom: theme.spacing.xxl },
  title: { ...theme.typography.title, marginBottom: theme.spacing.lg },
  loader: { paddingVertical: theme.spacing.lg },
  cardsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  card: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: '#fff', ...theme.shadows.small },
  cardLabel: { ...theme.typography.caption },
  cardValue: { fontSize: 18, fontWeight: 'bold' },
  section: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, ...theme.typography.subtitle, fontSize: 18 },
  helperText: { ...theme.typography.caption, marginBottom: theme.spacing.sm },
  blockCard: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  blockTitle: { ...theme.typography.label, marginBottom: theme.spacing.xs },
  item: { padding: theme.spacing.md, backgroundColor: '#fff', borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: '#e5e7eb' },
  itemTitle: { fontWeight: 'bold', ...theme.typography.body },
  empty: { ...theme.typography.caption, fontStyle: 'italic', paddingVertical: theme.spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: {
    ...theme.typography.caption,
    color: '#9ca3af',
    marginTop: theme.spacing.xs
  },
  actions: { marginVertical: theme.spacing.sm },
  logout: { marginTop: 'auto' }
});

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: color }]}> 
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  );
}
