import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, FlatList, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/store/api';

const fmt = (n: number) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

export default function Panier() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const { items, updateQte, removeItem, clearCart, total, totalItems } = useCartStore();
  const [confirmed, setConfirmed] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleValider = async () => {
    if (items.length === 0) return;
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    setCheckoutError(null);
    setPlacingOrder(true);
    try {
      await api.placeOrder(token, {
        items,
        total: total(),
        delivery: 'À négocier',
        paymentMethod: 'Paiement sur place',
      });
      clearCart();
      setConfirmed(true);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Impossible de valider la commande');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mon panier</Text>
          <Text style={styles.subtitle}>{totalItems()} article{totalItems() > 1 ? 's' : ''}</Text>
        </View>
        <Text style={styles.headerTotal}>{fmt(total())}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Votre panier est vide</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.imgPlaceholder}>
                <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.nom}</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>{item.localisation}</Text>
                </View>
                <Text style={styles.cardPrice}>{fmt(item.prixUnit)}</Text>
                <Text style={styles.cardPriceUnit}>{fmt(item.prixUnit)}/tête</Text>
              </View>
              <View style={styles.rightCol}>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeIcon}>🗑</Text>
                </TouchableOpacity>
                <View style={styles.qteRow}>
                  <TouchableOpacity style={styles.qteBtn} onPress={() => updateQte(item.id, item.quantite - 1)}>
                    <Text style={styles.qteBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qteVal}>{item.quantite}</Text>
                  <TouchableOpacity style={styles.qteBtn} onPress={() => updateQte(item.id, item.quantite + 1)}>
                    <Text style={styles.qteBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.recap}>
              <Text style={styles.recapTitle}>Récapitulatif</Text>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Sous-total</Text>
                <Text style={styles.recapValue}>{fmt(total())}</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Livraison</Text>
                <Text style={[styles.recapValue, { color: '#1B4332' }]}>À négocier</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.recapRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{fmt(total())}</Text>
              </View>
            </View>
          }
        />
      )}

      {checkoutError ? <Text style={styles.checkoutError}>{checkoutError}</Text> : null}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnValider, items.length === 0 && styles.btnDisabled]}
          onPress={handleValider}
          disabled={items.length === 0 || placingOrder}
        >
          {placingOrder ? (
            <Text style={styles.btnValiderText}>En cours...</Text>
          ) : (
            <>
              <Text style={styles.btnValiderIcon}>🛒</Text>
              <Text style={styles.btnValiderText}>Valider la commande — {fmt(total())}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={confirmed} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Commande envoyée !</Text>
            <Text style={styles.modalSubtitle}>
              Votre commande a été transmise aux vendeurs.{'\n'}
              Suivez-la dans l'onglet Commandes.
            </Text>
            <TouchableOpacity
              style={styles.btnCommandes}
              onPress={() => {
                setConfirmed(false);
                clearCart();
                router.replace('/(tabs)/commandes');
              }}
            >
              <Text style={styles.btnCommandesText}>Voir mes commandes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

import { useState } from 'react';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  headerTotal: { fontSize: 16, fontWeight: 'bold', color: '#1B4332' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 },
  imgPlaceholder: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4 },
  locationIcon: { fontSize: 11 },
  locationText: { fontSize: 12, color: '#6B7280' },
  cardPrice: { fontSize: 14, fontWeight: 'bold', color: '#1B4332' },
  cardPriceUnit: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  rightCol: { alignItems: 'center', gap: 12 },
  removeIcon: { fontSize: 16 },
  qteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qteBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  qteBtnText: { fontSize: 16, color: '#1A1A1A', lineHeight: 20 },
  qteVal: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', minWidth: 16, textAlign: 'center' },
  recap: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F3F4F6', marginTop: 4 },
  recapTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  recapLabel: { fontSize: 14, color: '#6B7280' },
  recapValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1B4332' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: '#FAF7F0' },
  btnValider: { backgroundColor: '#1B4332', borderRadius: 28, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnValiderIcon: { fontSize: 16 },
  btnValiderText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  checkoutError: { paddingHorizontal: 20, color: '#EF4444', textAlign: 'center', marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FAF7F0', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, alignItems: 'center', paddingBottom: 48 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  checkIcon: { fontSize: 32, color: '#22C55E' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  btnCommandes: { backgroundColor: '#1B4332', borderRadius: 28, paddingVertical: 16, paddingHorizontal: 40 },
  btnCommandesText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
