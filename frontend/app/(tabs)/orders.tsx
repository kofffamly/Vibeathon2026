import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, Order, ORDER_STATUS_MAP } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function Orders() {
  const { session } = useAuthStore();
  const [tab, setTab] = useState<'achats' | 'ventes'>('achats');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!session) return;
    setLoading(true);
    const field = tab === 'achats' ? 'buyer_id' : 'seller_id';
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, listings(title, unit))')
      .eq(field, session.user.id)
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [tab, session]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const st = ORDER_STATUS_MAP[item.status] ?? { label: item.status, color: '#6b7280' };
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardId}>Commande #{item.id.slice(0, 8)}</Text>
          <View style={[s.badge, { backgroundColor: st.color + '22' }]}>
            <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
        <Text style={s.total}>{item.total_price.toLocaleString()} FCFA</Text>
        <Text style={s.date}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
        <View style={s.actions}>
          {tab === 'ventes' && item.status === 'pending' && (
            <TouchableOpacity style={s.actionBtn} onPress={() => updateStatus(item.id, 'confirmed')}>
              <Text style={s.actionText}>✅ Confirmer</Text>
            </TouchableOpacity>
          )}
          {tab === 'ventes' && item.status === 'confirmed' && (
            <TouchableOpacity style={s.actionBtn} onPress={() => updateStatus(item.id, 'delivered')}>
              <Text style={s.actionText}>🚚 Livré</Text>
            </TouchableOpacity>
          )}
          {item.status === 'pending' && (
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#fee2e2' }]} onPress={() => updateStatus(item.id, 'cancelled')}>
              <Text style={[s.actionText, { color: '#dc2626' }]}>✕ Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Text style={s.title}>📦 Commandes</Text>
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tabBtn, tab === 'achats' && s.tabActive]} onPress={() => setTab('achats')}>
          <Text style={[s.tabText, tab === 'achats' && s.tabTextActive]}>Mes achats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, tab === 'ventes' && s.tabActive]} onPress={() => setTab('ventes')}>
          <Text style={[s.tabText, tab === 'ventes' && s.tabTextActive]}>Mes ventes</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
          renderItem={renderOrder}
          ListEmptyComponent={<Text style={s.empty}>Aucune commande</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 10, marginBottom: 16, padding: 4 },
  tabBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#15803d' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardId: { fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '700', color: '#16a34a', marginBottom: 4 },
  date: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0fdf4' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 15 },
});
