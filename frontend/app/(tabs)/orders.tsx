import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { BUYER_ORDERS, SELLER_ORDERS } from '@/data/mockData';
import OrderCard from '@/components/OrderCard';
import { useCartStore } from '@/store/cartStore';

export default function OrdersScreen() {
  const router     = useRouter();
  const [tab, setTab] = useState<'achats' | 'ventes'>('achats');

  // Commandes issues du panier validé
  const cartItems = useCartStore(s => s.items);
  const cartOrders = cartItems.map(item => ({
    id:          `cart-${item.listing.id}`,
    title:       item.listing.title,
    counterpart: 'Vendeur vérifié',
    qty:         `${item.qty} unité(s)`,
    total:       `${(parseInt(item.listing.price.replace(/\s/g, ''), 10) * item.qty).toLocaleString('fr-FR')} FCFA`,
    date:        new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    status:      'en_attente' as const,
    image:       item.listing.image,
  }));

  const orders = tab === 'achats' ? [...cartOrders, ...BUYER_ORDERS] : SELLER_ORDERS;

  const stats = [
    { label: 'Total',    value: orders.length.toString(),                                                                    color: Colors.primary },
    { label: 'En cours', value: orders.filter(o => o.status === 'en_cours' || o.status === 'en_attente').length.toString(), color: '#1E40AF' },
    { label: 'Livrées',  value: orders.filter(o => o.status === 'livree').length.toString(),                                color: Colors.success },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Commandes</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['achats', 'ventes'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>
                {t === 'achats' ? '📥 Mes achats' : '📤 Mes ventes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 32 }}>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            mode={tab === 'achats' ? 'buyer' : 'seller'}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 20 },
  title:        { fontSize: 20, fontWeight: '800', color: Colors.fg, paddingTop: 4, paddingBottom: 14 },
  tabs:         { flexDirection: 'row', backgroundColor: Colors.bg, borderRadius: 12, padding: 4 },
  tab:          { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabActive:    { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabTxt:       { fontSize: 13, fontWeight: '700', color: Colors.mutedFg },
  tabTxtActive: { color: Colors.fg },
  stats:        { flexDirection: 'row', gap: 10, paddingVertical: 14 },
  statCard:     { flex: 1, backgroundColor: Colors.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
  statVal:      { fontSize: 20, fontWeight: '800' },
  statLabel:    { fontSize: 10, fontWeight: '600', color: Colors.mutedFg, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});
