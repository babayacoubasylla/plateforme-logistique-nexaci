import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { getMyHistory } from '../services/api';

export default function HistoryScreen() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getMyHistory();
      setItems(resp?.data?.data?.colis || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des livraisons</Text>
      {loading ? (
        <View style={styles.loader}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>Aucun historique pour l'instant.</Text>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.reference}</Text>
              <Text>Statut: {item.statut}</Text>
              <Text>Montant: XOF {(item?.tarif?.total ?? 0).toLocaleString?.() || 0}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  loader: { paddingVertical: 12 },
  item: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  itemTitle: { fontWeight: 'bold' },
  empty: { color: '#666', fontStyle: 'italic', marginTop: 16 }
});
