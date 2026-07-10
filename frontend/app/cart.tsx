import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQty, clearCart } = useCart();
  const [confirmed, setConfirmed] = useState(false);

  const total = cartItems.reduce((sum, item) => {
    return sum + parseInt(item.listing.price.replace(/\s/g, ''), 10) * item.qty;
  }, 0);

  if (confirmed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 44 }}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Commande envoyée !</Text>
        <Text style={styles.successDesc}>
          Votre commande a été transmise aux vendeurs. Suivez-la dans l'onglet Commandes.
        </Text>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => { clearCart(); setConfirmed(false); router.push('/(tabs)/orders'); }}
        >
          <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.btnGrad}>
            <Text style={styles.btnTxt}>Voir mes commandes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mon panier</Text>
          <Text style={styles.headerSub}>
            {cartItems.length === 0 ? 'Vide' : `${cartItems.reduce((s, i) => s + i.qty, 0)} article(s)`}
          </Text>
        </View>
        {cartItems.length > 0 && (
          <View style={styles.totalPill}>
            <Text style={styles.totalPillTxt}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 120 }}>
        {cartItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🛒</Text>
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptySub}>Explorez le marché et ajoutez des produits.</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.btnGrad}>
                <Text style={styles.btnTxt}>Explorer le marché</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map(item => {
              const price = parseInt(item.listing.price.replace(/\s/g, ''), 10);
              return (
                <View key={item.listing.id} style={styles.item}>
                  <Image source={{ uri: item.listing.image }} style={styles.itemImg} />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.listing.title}</Text>
                    <Text style={styles.itemLoc}>📍 {item.listing.location}</Text>
                    <View style={styles.itemFooter}>
                      <View style={styles.qtyCtrl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(item.listing.id, item.qty - 1)}
                        >
                          <Text style={styles.qtyBtnTxt}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.qtyVal}>
                          <Text style={styles.qtyValTxt}>{item.qty}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(item.listing.id, item.qty + 1)}
                        >
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

            {/* ── Summary ── */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Sous-total</Text>
                <Text style={styles.summaryVal}>{total.toLocaleString('fr-FR')} FCFA</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Livraison</Text>
                <Text style={[styles.summaryVal, { color: Colors.success }]}>À négocier</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={[styles.summaryKey, { fontWeight: '800', color: Colors.fg }]}>Total</Text>
                <Text style={[styles.summaryVal, { color: Colors.primary, fontSize: 16 }]}>
                  {total.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutBar}>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => setConfirmed(true)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.btnGrad}>
              <Text style={styles.btnTxt}>✅ Valider — {total.toLocaleString('fr-FR')} FCFA</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: Colors.fg },
  headerSub:    { fontSize: 12, color: Colors.mutedFg, fontWeight: '500', marginTop: 1 },
  totalPill:    { backgroundColor: `${Colors.primary}18`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  totalPillTxt: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyTitle:   { fontSize: 22, fontWeight: '700', color: Colors.fg, marginBottom: 8 },
  emptySub:     { fontSize: 14, color: Colors.mutedFg, fontWeight: '500', marginBottom: 24, textAlign: 'center' },
  exploreBtn:   { borderRadius: 14, overflow: 'hidden' },
  btnGrad:      { paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center' },
  btnTxt:       { color: Colors.white, fontSize: 15, fontWeight: '800' },
  item: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  itemImg:      { width: 90 },
  itemBody:     { flex: 1, padding: 14 },
  itemTitle:    { fontSize: 13, fontWeight: '700', color: Colors.fg, marginBottom: 2 },
  itemLoc:      { fontSize: 11, color: Colors.mutedFg, fontWeight: '500', marginBottom: 8 },
  itemFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyCtrl:      { flexDirection: 'row' },
  qtyBtn: {
    width: 28, height: 28, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
  },
  qtyBtnTxt:    { fontSize: 16, fontWeight: '700', color: Colors.fg },
  qtyVal: {
    width: 36, height: 28, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyValTxt:    { fontSize: 13, fontWeight: '800', color: Colors.fg },
  subtotal:     { fontSize: 13, fontWeight: '800', color: Colors.primary },
  perUnit:      { fontSize: 10, color: Colors.mutedFg, fontWeight: '500' },
  summary: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 10,
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: Colors.fg, marginBottom: 2 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4 },
  summaryKey:   { fontSize: 13, color: Colors.mutedFg, fontWeight: '500' },
  summaryVal:   { fontSize: 13, fontWeight: '700', color: Colors.fg },
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: 16, paddingBottom: 32,
  },
  checkoutBtn:  { borderRadius: 14, overflow: 'hidden' },
  successIcon: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: `${Colors.success}20`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 26, fontWeight: '700', color: Colors.fg, marginBottom: 8, textAlign: 'center' },
  successDesc:  { fontSize: 14, color: Colors.mutedFg, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  successBtn:   { borderRadius: 14, overflow: 'hidden' },
});
