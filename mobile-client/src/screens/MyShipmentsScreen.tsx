import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { getMyColis } from '../services/api';
import { theme } from '../theme';
import { formatDate } from '../utils/dateFormatter';

export default function MyShipmentsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getMyColis();
      const list = resp?.data?.data?.colis || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      contentContainerStyle={items.length === 0 ? styles.center : undefined}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ColisDetail', { id: item._id })}>
          <Card style={styles.item}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.reference || 'Colis'}</Text>
              <StatusBadge status={item.statut || item.status} />
            </View>
            {item.destinataire?.nom ? <Text style={styles.infoText}>👤 {item.destinataire.nom}</Text> : null}
            {item.destinataire?.telephone ? <Text style={styles.infoText}>📞 {item.destinataire.telephone}</Text> : null}
            {item.createdAt ? (
              <Text style={styles.dateText}>🕒 {formatDate(item.createdAt)}</Text>
            ) : null}
          </Card>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <EmptyState 
          icon="📦"
          title="Aucun colis" 
          subtitle="Vous n'avez pas encore créé de colis. Commencez par créer votre premier envoi depuis l'écran d'accueil."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  item: { marginHorizontal: theme.spacing.md, marginVertical: theme.spacing.xs },
  title: { ...theme.typography.label },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  infoText: {
    ...theme.typography.body,
    color: '#6b7280',
    marginTop: theme.spacing.xs
  },
  dateText: {
    ...theme.typography.caption,
    color: '#9ca3af',
    marginTop: theme.spacing.sm
  }
});
