import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/store/api';
import type { Order } from '@/types';

export default function Commandes() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const charger = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getOrders(token);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les commandes');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [token]);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mes commandes</Text>
        <Text style={styles.subtitle}>Connectez-vous pour voir vos commandes.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.loginText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Mes commandes</Text>
      {loading && <Text style={styles.message}>Chargement...</Text>}
      {error && <Text style={[styles.message, styles.errorText]}>{error}</Text>}
      {!loading && !orders.length ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucune commande pour l'instant</Text>
          <Text style={styles.emptySubtitle}>Passez une commande depuis le panier.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Commande #{item.id}</Text>
                <Text style={[styles.status, item.status === 'Payée' ? styles.statusPaid : styles.statusPending]}>{item.status}</Text>
              </View>
              <Text style={styles.smallText}>Montant total : {item.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA</Text>
              <Text style={styles.smallText}>Méthode : {item.paymentMethod}</Text>
              <Text style={styles.smallText}>Livraison : {item.delivery}</Text>
              <Text style={styles.sectionTitle}>Articles</Text>
              {item.items.map((article) => (
                <View key={article.id} style={styles.itemRow}>
                  <Text style={styles.itemText}>{article.emoji} {article.nom} x{article.quantite}</Text>
                  <Text style={styles.itemText}>{(article.prixUnit * article.quantite).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA</Text>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F0', paddingHorizontal: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4332', marginBottom: 14 },
  message: { color: '#6B7280', marginBottom: 12 },
  errorText: { color: '#EF4444' },
  list: { paddingBottom: 60 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  status: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, color: '#fff' },
  statusPaid: { backgroundColor: '#16A34A' },
  statusPending: { backgroundColor: '#F59E0B' },
  smallText: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginTop: 8, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemText: { fontSize: 12, color: '#1A1A1A' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#6B7280' },
  loginButton: { marginTop: 18, backgroundColor: '#1B4332', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28 },
  loginText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
