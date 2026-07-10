import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase, CATEGORY_EMOJI } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

// ── Tab bar identique à la maquette ─────────────────────────
function BottomNav({ active }: { active: string }) {
  const router = useRouter();
  const totalItems = useCartStore(s => s.totalItems());
  const insets = useSafeAreaInsets();

  const tabs = [
    { key: 'marche',    emoji: '🏪', label: 'Marché',    route: '/(tabs)' },
    { key: 'panier',    emoji: '🛒', label: 'Panier',    route: '/cart' },
    { key: 'publish',   emoji: '+',  label: '',          route: '/(tabs)/publish', fab: true },
    { key: 'commandes', emoji: '📦', label: 'Commandes', route: '/(tabs)/orders' },
    { key: 'profil',    emoji: '👤', label: 'Profil',    route: '/(tabs)/profile' },
  ];

  return (
    <View style={[nb.bar, { paddingBottom: insets.bottom }]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={nb.item}
          onPress={() => router.replace(tab.route as any)}
        >
          {tab.fab ? (
            <View style={nb.fab}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30 }}>+</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={{ position: 'relative' }}>
                <Text style={{ fontSize: 20 }}>{tab.emoji}</Text>
                {tab.key === 'panier' && totalItems > 0 && (
                  <View style={nb.badge}>
                    <Text style={nb.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                  </View>
                )}
              </View>
              <Text style={[nb.label, active === tab.key && nb.labelActive]}>{tab.label}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Composant principal ──────────────────────────────────────
export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { items, updateQty, removeItem, clearCart, total } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkout = async () => {
    if (!session || items.length === 0) return;
    setLoading(true);
    const inserts = items.map(i => ({
      recolte_id: i.recolte.id,
      acheteur_id: session.user.id,
      statut: 'en_attente',
    }));
    await supabase.from('missions_transport').insert(inserts);
    setLoading(false);
    clearCart();
    setSuccess(true);
  };

  // ── Écran succès ──
  if (success) return (
    <SafeAreaView style={s.successBg} edges={['top', 'bottom']}>
      <View style={s.successBox}>
        <View style={s.successIconWrap}>
          <Text style={{ fontSize: 32, color: '#fff' }}>✓</Text>
        </View>
        <Text style={s.successTitle}>Commande envoyée !</Text>
        <Text style={s.successSub}>
          Votre commande a été transmise aux vendeurs.{'\n'}Suivez-la dans l'onglet Commandes.
        </Text>
        <TouchableOpacity
          style={s.successBtn}
          onPress={() => { setSuccess(false); router.replace('/(tabs)/orders'); }}
        >
          <Text style={s.successBtnText}>Voir mes commandes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.successBtn, { backgroundColor: '#f0fdf4', marginTop: 12 }]}
          onPress={() => { setSuccess(false); router.replace('/(tabs)'); }}
        >
          <Text style={[s.successBtnText, { color: '#2d6a4f' }]}>🛍️ Continuer les achats</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Panier vide ──
  if (items.length === 0) return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mon panier</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🛒</Text>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#1a3a2a', marginBottom: 8 }}>
          Panier vide
        </Text>
        <Text style={{ fontSize: 14, color: '#aaa', marginBottom: 28, textAlign: 'center' }}>
          Explorez le marché et ajoutez{'\n'}des produits à votre panier
        </Text>
        <TouchableOpacity style={s.goShopBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.goShopText}>🛍️  Explorer le marché</Text>
        </TouchableOpacity>
      </View>
      <BottomNav active="panier" />
    </SafeAreaView>
  );

  // ── Panier rempli ──
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mon panier</Text>
        <Text style={s.headerTotal}>{total().toLocaleString()} FCFA</Text>
      </View>
      <Text style={s.itemCount}>{items.length} article{items.length > 1 ? 's' : ''}</Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map(item => {
          const emoji = CATEGORY_EMOJI[item.recolte.type_produit?.toLowerCase()] ?? '📦';
          const lineTotal = item.recolte.prix_fcfa_kg * item.quantity;
          return (
            <View key={item.recolte.id} style={s.card}>
              {item.recolte.photo_url ? (
                <Image source={{ uri: item.recolte.photo_url }} style={s.cardImg} />
              ) : (
                <View style={[s.cardImg, s.cardImgPlaceholder]}>
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </View>
              )}
              <View style={s.cardBody}>
                <Text style={s.itemTitle} numberOfLines={2}>{item.recolte.type_produit}</Text>
                {item.recolte.profiles?.zone && (
                  <Text style={s.itemZone}>📍 {item.recolte.profiles.zone}</Text>
                )}
                <Text style={s.itemPrice}>{lineTotal.toLocaleString()} FCFA</Text>
                <Text style={s.itemPriceSub}>{item.recolte.prix_fcfa_kg.toLocaleString()} FCFA/kg</Text>
              </View>
              <View style={s.qtyCol}>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => item.quantity > 1
                    ? updateQty(item.recolte.id, item.quantity - 1)
                    : removeItem(item.recolte.id)}
                >
                  <Text style={s.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={s.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => updateQty(item.recolte.id, item.quantity + 1)}
                >
                  <Text style={s.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Récapitulatif */}
        <View style={s.recap}>
          <Text style={s.recapTitle}>Récapitulatif</Text>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Sous-total</Text>
            <Text style={s.recapValue}>{total().toLocaleString()} FCFA</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Livraison</Text>
            <Text style={[s.recapValue, { color: '#2d6a4f' }]}>À négocier</Text>
          </View>
          <View style={s.divider} />
          <View style={s.recapRow}>
            <Text style={s.recapTotalLabel}>Total</Text>
            <Text style={s.recapTotalValue}>{total().toLocaleString()} FCFA</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton valider + tab bar */}
      <View style={s.bottomArea}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <TouchableOpacity style={s.checkoutBtn} onPress={checkout} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.checkoutBtnText}>✅  Valider la commande — {total().toLocaleString()} FCFA</Text>
            }
          </TouchableOpacity>
        </View>
        <BottomNav active="panier" />
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────
const nb = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderColor: '#e8e0d0',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  label: { fontSize: 10, color: '#aaa', marginTop: 2 },
  labelActive: { color: '#2d6a4f', fontWeight: '700' },
  fab: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#2d6a4f', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    elevation: 6, shadowColor: '#2d6a4f', shadowOpacity: 0.4, shadowRadius: 8,
  },
  badge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#e53e3e', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f5f0' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e8e0d0',
  },
  backText: { fontSize: 18, color: '#1a3a2a', fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1a3a2a' },
  headerTotal: { fontSize: 16, fontWeight: '800', color: '#2d6a4f' },
  itemCount: { paddingHorizontal: 16, fontSize: 13, color: '#888', marginBottom: 14 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginBottom: 12,
    padding: 12, gap: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardImg: { width: 76, height: 76, borderRadius: 10 },
  cardImgPlaceholder: { backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  itemTitle: { fontWeight: '700', color: '#1a3a2a', fontSize: 14, marginBottom: 2 },
  itemZone: { fontSize: 11, color: '#aaa', marginBottom: 6 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#2d6a4f' },
  itemPriceSub: { fontSize: 10, color: '#aaa' },

  qtyCol: { alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f5f0e8', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e0dbd0',
  },
  qtyBtnText: { fontSize: 16, color: '#2d6a4f', fontWeight: '700', lineHeight: 20 },
  qty: { fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },

  recap: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 14, padding: 16, marginTop: 4,
  },
  recapTitle: { fontSize: 15, fontWeight: '700', color: '#1a3a2a', marginBottom: 14 },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  recapLabel: { fontSize: 14, color: '#555' },
  recapValue: { fontSize: 14, fontWeight: '600', color: '#1a3a2a' },
  divider: { height: 1, backgroundColor: '#e8e0d0', marginVertical: 8 },
  recapTotalLabel: { fontSize: 16, fontWeight: '700', color: '#1a3a2a' },
  recapTotalValue: { fontSize: 18, fontWeight: '800', color: '#2d6a4f' },

  bottomArea: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#f7f5f0', borderTopWidth: 1, borderColor: '#e0dbd0',
  },
  checkoutBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 14, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  goShopBtn: { backgroundColor: '#2d6a4f', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  goShopText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  successBg: { flex: 1, backgroundColor: '#f7f5f0', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successBox: { alignItems: 'center', width: '100%' },
  successIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#2d6a4f', alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    elevation: 4, shadowColor: '#2d6a4f', shadowOpacity: 0.3, shadowRadius: 12,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#1a3a2a', marginBottom: 12 },
  successSub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 23, marginBottom: 36 },
  successBtn: { backgroundColor: '#2d6a4f', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, width: '100%', alignItems: 'center' },
  successBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
