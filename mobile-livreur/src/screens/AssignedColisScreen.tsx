import * as React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getMyAssignedColis } from '@/services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { theme } from '../theme';
import { formatDate } from '../utils/dateFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'AssignedColis'>;

export default function AssignedColisScreen({ navigation }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getMyAssignedColis();
      const list = resp?.data?.data?.colis || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Erreur chargement colis:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // StatusBadge gère couleurs et label

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      contentContainerStyle={items.length === 0 ? styles.center : styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('ColisDetail', { colisId: item._id })}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.reference}>{item.reference || 'N/A'}</Text>
            <StatusBadge status={item.statut} />
          </View>
          
          {item.destinataire?.nom && (
            <Text style={styles.label}>👤 {item.destinataire.nom}</Text>
          )}
          {item.destinataire?.telephone && (
            <Text style={styles.label}>📞 {item.destinataire.telephone}</Text>
          )}
          {item.adresse && (
            <Text style={styles.label}>📍 {item.adresse}</Text>
          )}
          {item.agence_relais?.nom && (
            <Text style={styles.label}>🏪 Point relais: {item.agence_relais.nom}</Text>
          )}
          {item.createdAt && (
            <Text style={styles.dateText}>🕒 {formatDate(item.createdAt)}</Text>
          )}
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="�"
          title="Aucune livraison assignée"
          subtitle="Vous n'avez pas de colis à livrer pour le moment. Les nouvelles missions apparaîtront ici."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: '#f9fafb' },
  list: { padding: theme.spacing.md },
  loadingText: { marginTop: theme.spacing.md, color: '#666' },
  item: {
    backgroundColor: '#fff',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  reference: { ...theme.typography.label, color: theme.colors.primary },
  label: { ...theme.typography.body, color: '#6b7280', marginBottom: theme.spacing.xs },
  dateText: { ...theme.typography.caption, color: '#9ca3af', marginTop: theme.spacing.sm }
});
