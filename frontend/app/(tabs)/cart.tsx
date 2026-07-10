import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCartStore } from '@/store/cartStore';
import { apiClient } from '@/api/client';

export default function CartScreen() {
  const router = useRouter();
  const items      = useCartStore(s => s.items);
  const updateQty  = useCartStore(s => s.updateQty);
  const clearCart  = useCartStore(s => s.clearCart);
  const total      = useCartStore(s => s.total)();
  const totalItems = useCartStore(s => s.totalItems)();
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cartItems = items;

  const submitOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        items: cartItems.map(item => ({
          productId: item.listing.id,
          title: item.listing.title,
          qty: item.qty,
          price: typeof item.listing.price === 'number'
            ? item.listing.price
            : parseInt(String(item.listing.price).replace(/[^\d]/g, ''), 10) || 0,
        })),
        total: total,
      };
      await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setConfirmed(true);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('401') || msg.toLowerCase().includes('token')) {
        alert('Vous devez être connecté pour passer une commande. Veuillez vous connecter dans l\'onglet Profil.');
      } else {
        alert('Une erreur est survenue lors de la commande. Vérifiez que le serveur est démarré.');
      }
      console.warn('Error submitting order', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>✅</Text>
        <Text style={styles.successTitle}>Commande envoyée !</Text>
        <Text style={styles.successDesc}>
          Votre commande a été transmise aux vendeurs. Suivez-la dans l'onglet Commandes.
        </Text>
        <TouchableOpacity
          style={styles.validateBtn}
          onPress={() => { clearCart(); setConfirmed(false); router.push('/(tabs)/orders'); }}
        >
          <Text style={styles.validateTxt}>Voir mes commandes</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mon panier</Text>
          <Text style={styles.headerSub}>
            {cartItems.length === 0 ? 'Vide' : `${totalItems} article(s)`}
          </Text>
        </View>
        {cartItems.length > 0 && (
          <Text style={styles.headerTotal}>{total.toLocaleString('fr-FR')} FCFA</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
        {cartItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🛒</Text>
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptySub}>Explorez le marché et ajoutez des produits.</Text>
            <TouchableOpacity style={styles.validateBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.validateTxt}>Explorer le marché</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map(item => {
              const raw = item.listing.price;
              const price = typeof raw === 'number'
                ? raw
                : parseInt(String(raw).replace(/[^\d]/g, ''), 10) || 0;
              return (
                <View key={item.listing.id} style={styles.item}>
                  <Image source={{ uri: item.listing.image }} style={styles.itemImg} />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.listing.title}</Text>
                    <View style={styles.itemLocRow}>
                      <Ionicons name="location-sharp" size={11} color={Colors.mutedFg} />
                      <Text style={styles.itemLoc}>{item.listing.location}</Text>
                    </View>
                    <View style={styles.itemFooter}>
                      <View style={styles.qtyCtrl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.listing.id, item.qty - 1)}>
                          <Text style={styles.qtyBtnTxt}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.qtyVal}>
                          <Text style={styles.qtyValTxt}>{item.qty}</Text>
                        </View>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.listing.id, item.qty + 1)}>
                          <Text style={[styles.qtyBtnTxt, { color: Colors.primary }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.subtotal}>{(price * item.qty).toLocaleString('fr-FR')} FCFA</Text>
                        <Text style={styles.perUnit}>{item.listing.price} {item.listing.unit}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* ── Récapitulatif ── */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Sous-total</Text>
                <Text style={styles.summaryVal}>{total.toLocaleString('fr-FR')} FCFA</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Livraison</Text>
                <Text style={[styles.summaryVal, { color: Colors.success }]}>À négocier</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalKey}>Total</Text>
                <Text style={styles.totalVal}>{total.toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutBar}>
          <TouchableOpacity 
            style={[styles.validateBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={submitOrder} 
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text style={styles.validateTxt}>
              {isSubmitting ? 'Validation...' : `✅ Valider la commande — ${total.toLocaleString('fr-FR')} FCFA`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F0' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.fg },
  headerSub:   { fontSize: 12, color: Colors.mutedFg, marginTop: 2 },
  headerTotal: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.fg, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: Colors.mutedFg, textAlign: 'center', marginBottom: 24 },

  item: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  itemImg:    { width: 90, height: 90 },
  itemBody:   { flex: 1, padding: 12 },
  itemTitle:  { fontSize: 13, fontWeight: '700', color: Colors.fg, marginBottom: 4 },
  itemLocRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
  itemLoc:    { fontSize: 11, color: Colors.mutedFg },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  qtyCtrl: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 28, height: 28, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', borderRadius: 6,
  },
  qtyBtnTxt: { fontSize: 16, fontWeight: '700', color: Colors.fg },
  qtyVal: {
    width: 32, height: 28, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyValTxt: { fontSize: 13, fontWeight: '800', color: Colors.fg },
  subtotal:  { fontSize: 13, fontWeight: '800', color: Colors.primary },
  perUnit:   { fontSize: 10, color: Colors.mutedFg },

  summary: {
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: Colors.fg },
  divider:      { height: 1, backgroundColor: Colors.border },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryKey:   { fontSize: 13, color: Colors.mutedFg },
  summaryVal:   { fontSize: 13, fontWeight: '600', color: Colors.fg },
  totalKey:     { fontSize: 14, fontWeight: '800', color: Colors.fg },
  totalVal:     { fontSize: 15, fontWeight: '800', color: Colors.primary },

  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: 16, paddingBottom: 28,
  },
  validateBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  validateTxt: { color: Colors.white, fontSize: 15, fontWeight: '800' },

  successTitle: { fontSize: 24, fontWeight: '700', color: Colors.fg, marginBottom: 8, textAlign: 'center' },
  successDesc:  { fontSize: 14, color: Colors.mutedFg, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
