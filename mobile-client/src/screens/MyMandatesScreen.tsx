import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { getMyMandats } from '../services/mandatService';
import { theme } from '../theme';
import { formatDate } from '../utils/dateFormatter';

export default function MyMandatesScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mandats, setMandats] = useState<any[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getMyMandats();
      setMandats(resp?.data?.data?.mandats || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally { setRefreshing(false); }
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator /></View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {mandats.length === 0 ? (
        <EmptyState icon="📄" title="Aucun mandat" subtitle="Créez une demande de mandat pour la voir apparaître ici." />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: theme.spacing.md }}
          data={mandats}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MandateDetail', { id: item._id })}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{item.reference}</Text>
                <StatusBadge status={item.statut} />
              </View>
              <Text style={styles.info}>📑 {item?.type_document?.nom || 'Type inconnu'}</Text>
              <Text style={styles.info}>🏢 {item?.administration?.nom || 'Administration'}</Text>
              {item.createdAt ? <Text style={styles.date}>🕒 {formatDate(item.createdAt)}</Text> : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  card: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: '#e5e7eb' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...theme.typography.label },
  info: { ...theme.typography.body, color: '#6b7280', marginTop: theme.spacing.xs },
  date: { ...theme.typography.caption, color: '#9ca3af', marginTop: theme.spacing.xs }
});
