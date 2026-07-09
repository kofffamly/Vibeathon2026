import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { OrderData } from '@/data/mockData';

type Status = 'en_attente' | 'en_cours' | 'confirmee' | 'livree';

const STATUS_MAP: Record<Status, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  en_cours:   { label: 'En route',   bg: '#DBEAFE', color: '#1E40AF' },
  confirmee:  { label: 'Confirmée',  bg: '#D1FAE5', color: '#065F46' },
  livree:     { label: 'Livrée',     bg: '#ECFDF5', color: '#064E3B' },
};

interface Props {
  order:      OrderData;
  mode:       'buyer' | 'seller';
  onContact?: () => void;
  onConfirm?: () => void;
}

export default function OrderCard({ order, mode, onContact, onConfirm }: Props) {
  const st = STATUS_MAP[order.status];
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {mode === 'buyer' && order.image && (
          <Image source={{ uri: order.image }} style={styles.image} />
        )}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>{order.title}</Text>
            <View style={[styles.badge, { backgroundColor: st.bg }]}>
              <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
          <Text style={styles.sub}>
            {mode === 'buyer' ? 'Vendeur : ' : 'Acheteur : '}
            <Text style={{ fontWeight: '700' }}>{order.counterpart}</Text>
          </Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.total}>{order.total}</Text>
              <Text style={styles.qty}>{order.qty}</Text>
            </View>
            <Text style={styles.date}>{order.date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionTxt}>Voir détails</Text>
        </TouchableOpacity>
        {order.status !== 'livree' && (
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.fg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  top:       { flexDirection: 'row' },
  image:     { width: 80, height: 80 },
  body:      { flex: 1, padding: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  title:     { fontSize: 13, fontWeight: '800', color: Colors.fg, flex: 1, lineHeight: 18 },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  sub:       { fontSize: 11, color: Colors.mutedFg, fontWeight: '500', marginBottom: 8 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  total:     { fontSize: 14, fontWeight: '800', color: Colors.primary },
  qty:       { fontSize: 10, color: Colors.mutedFg, fontWeight: '500' },
  date:      { fontSize: 10, color: Colors.mutedFg, fontWeight: '500' },
  actions:   { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  actionTxt: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  sep:       { width: 1, backgroundColor: Colors.border },
});
