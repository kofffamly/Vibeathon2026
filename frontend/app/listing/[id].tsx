import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, Recolte, CATEGORY_LABELS, CATEGORY_EMOJI, STATUT_MAP } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [recolte, setRecolte] = useState<Recolte | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('recoltes')
      .select('*, profiles(nom_complet, telephone, zone, note_moyenne)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setRecolte(data); setLoading(false); });
  }, [id]);

  if (loading) return <ActivityIndicator color="#2d5a3d" style={{ flex: 1, marginTop: 100 }} />;
  if (!recolte) return <Text style={{ textAlign: 'center', marginTop: 100 }}>Annonce introuvable</Text>;

  const isOwner = session?.user.id === recolte.agriculteur_id;
  const seller = recolte.profiles;
  const emoji = CATEGORY_EMOJI[recolte.type_produit?.toLowerCase()] ?? '📦';
  const statut = STATUT_MAP[recolte.statut];
  const addItem = useCartStore(s => s.addItem);

  const handleContact = () => {
    if (isOwner) return Alert.alert('Info', 'C\'est votre propre annonce');
    Alert.alert('Contact', `Appeler ${seller?.telephone ?? 'non renseigné'}`);
  };

  const handleAddToCart = () => {
    addItem(recolte, 1);
    Alert.alert('✅ Ajouté au panier', recolte.type_produit, [
      { text: 'Continuer' },
      { text: 'Voir le panier', onPress: () => router.push('/cart') },
    ]);
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.imageWrap}>
          {recolte.photo_url ? (
            <Image source={{ uri: recolte.photo_url }} style={s.image} />
          ) : (
            <View style={[s.image, s.imagePlaceholder]}>
              <Text style={{ fontSize: 80 }}>{emoji}</Text>
            </View>
          )}
          <TouchableOpacity style={[s.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View style={[s.statutBadge, { backgroundColor: statut?.color ?? '#16a34a' }]}>
            <Text style={s.statutText}>{statut?.label ?? recolte.statut}</Text>
          </View>
        </View>

        <View style={s.content}>
          <View style={s.titleRow}>
            <Text style={s.title}>{recolte.type_produit}</Text>
            <View>
              <Text style={s.price}>{recolte.prix_fcfa_kg.toLocaleString()}</Text>
              <Text style={s.priceUnit}>FCFA/kg</Text>
            </View>
          </View>

          <Text style={s.qty}>📦 {recolte.quantite_kg} kg disponibles</Text>
          {recolte.qualite_score && <Text style={s.quality}>⭐ Qualité : {recolte.qualite_score}/5</Text>}

          {seller && (
            <View style={s.sellerCard}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>
                  {seller.nom_complet?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sellerName}>{seller.nom_complet}</Text>
                {seller.zone && <Text style={s.sellerZone}>📍 {seller.zone}</Text>}
                {seller.note_moyenne && <Text style={s.sellerNote}>⭐ {seller.note_moyenne.toFixed(1)}</Text>}
              </View>
              {seller.telephone && (
                <TouchableOpacity style={s.callBtn} onPress={handleContact}>
                  <Text style={s.callBtnText}>📞 Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={s.metaRow}>
            <View style={s.metaBox}>
              <Text style={s.metaIcon}>🏷️</Text>
              <Text style={s.metaLabel}>PRODUIT</Text>
              <Text style={s.metaValue}>{CATEGORY_LABELS[recolte.type_produit?.toLowerCase()] ?? recolte.type_produit}</Text>
            </View>
            {seller?.zone && (
              <View style={s.metaBox}>
                <Text style={s.metaIcon}>📍</Text>
                <Text style={s.metaLabel}>ZONE</Text>
                <Text style={s.metaValue}>{seller.zone}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {!isOwner && recolte.statut === 'disponible' && (
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={s.cartBtn} onPress={handleAddToCart}>
            <Text style={s.cartBtnText}>🛒  Ajouter au panier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.callBtnBottom} onPress={handleContact}>
            <Text style={{ fontSize: 20 }}>📞</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 280 },
  imagePlaceholder: { backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statutBadge: { position: 'absolute', bottom: 12, left: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statutText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a3a2a', flex: 1, marginRight: 12 },
  price: { fontSize: 22, fontWeight: '800', color: '#2d5a3d', textAlign: 'right' },
  priceUnit: { fontSize: 12, color: '#888', textAlign: 'right' },
  qty: { fontSize: 14, color: '#555', marginBottom: 4 },
  quality: { fontSize: 14, color: '#555', marginBottom: 16 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 20, gap: 12, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2d5a3d', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  sellerName: { fontWeight: '700', color: '#1a3a2a', fontSize: 15 },
  sellerZone: { fontSize: 12, color: '#888' },
  sellerNote: { fontSize: 12, color: '#888' },
  callBtn: { backgroundColor: '#f0fdf4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2d5a3d' },
  callBtnText: { color: '#2d5a3d', fontWeight: '700', fontSize: 13 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center' },
  metaIcon: { fontSize: 22, marginBottom: 4 },
  metaLabel: { fontSize: 10, color: '#aaa', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '700', color: '#1a3a2a', textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e8e0d0' },
  cartBtn: { flex: 1, backgroundColor: '#2d5a3d', padding: 16, borderRadius: 12, alignItems: 'center' },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  callBtnBottom: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2d5a3d' },
});
