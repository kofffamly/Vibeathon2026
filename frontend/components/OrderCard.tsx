import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ORDER_STATUS_MAP, type Order, type OrderStatus } from '@/lib/supabase';

interface Props {
  order:          Order;
  mode:           'buyer' | 'seller';
  onContact?:     () => void;
  onConfirm?:     () => void;
  onMarkDelivered?:() => void;
  onPress?:       () => void;
}

export default function OrderCard({ order, mode, onContact, onConfirm, onMarkDelivered, onPress }: Props) {
  const st        = ORDER_STATUS_MAP[order.status];
  const firstItem = order.order_items?.[0];
  const counterpart = mode === 'buyer'
    ? firstItem?.profiles?.full_name ?? 'Vendeur'
    : (order as any).profiles?.full_name ?? 'Acheteur';

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {firstItem?.listings?.image_url ? (
          <Image source={{ uri: firstItem.listings.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 28 }}>🌾</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>
              {firstItem?.listings?.title ?? 'Commande'}
            </Text>
            <View style={[styles.badge, { backgroundColor: st.bg }]}>
              <Text style={[styles.badgeText, { color: st.color }]}>{st.emoji} {st.label}</Text>
            </View>
          </View>
          <Text style={styles.sub}>
            {mode === 'buyer' ? 'Vendeur : ' : 'Acheteur : '}
            <Text style={{ fontWeight: '700' }}>{counterpart}</Text>
          </Text>
          <View style={styles.footer}>
            <Text style={styles.total}>{order.total.toLocaleString('fr-FR')} FCFA</Text>
            <Text style={styles.date}>
              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
          <Text style={styles.actionTxt}>Voir détails</Text>
        </TouchableOpacity>

        {order.status !== 'livree' && order.status !== 'annulee' && (
          <>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.actionBtn} onPress={onContact}>
              <Text style={[styles.actionTxt, { color: Colors.whatsapp }]}>💬 Contacter</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'seller' && order.status === 'en_attente' && (
          <>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.actionBtn} onPress={onConfirm}>
              <Text style={[styles.actionTxt, { color: Colors.success }]}>✅ Confirmer</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'seller' && order.status === 'en_cours' && (
          <>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.actionBtn} onPress={onMarkDelivered}>
              <Text style={[styles.actionTxt, { color: Colors.primary }]}>📦 Livré</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:            { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', shadowColor: Colors.fg, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  top:             { flexDirection: 'row' },
  image:           { width: 80, height: 80 },
  imagePlaceholder:{ backgroundColor: Colors.muted, alignItems: 'center', justifyContent: 'center' },
  body:            { flex: 1, padding: 12 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  title:           { fontSize: 13, fontWeight: '800', color: Colors.fg, flex: 1, lineHeight: 18 },
  badge:           { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  badgeText:       { fontSize: 10, fontWeight: '800' },
  sub:             { fontSize: 11, color: Colors.mutedFg, fontWeight: '500', marginBottom: 6 },
  footer:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  total:           { fontSize: 14, fontWeight: '800', color: Colors.primary },
  date:            { fontSize: 10, color: Colors.mutedFg, fontWeight: '500' },
  actions:         { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn:       { flex: 1, paddingVertical: 10, alignItems: 'center' },
  actionTxt:       { fontSize: 12, fontWeight: '700', color: Colors.primary },
  sep:             { width: 1, backgroundColor: Colors.border },
});
