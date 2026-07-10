import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase, Recolte } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import ListingCard from '../../components/ListingCard';

const CATEGORIES = [
  { key: null, label: 'Tout' },
  { key: 'mais', label: 'Maïs' },
  { key: 'riz', label: 'Riz' },
  { key: 'manioc', label: 'Manioc' },
  { key: 'animal', label: 'Animaux' },
  { key: 'autre', label: 'Autre' },
];

export default function Home() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const totalItems = useCartStore(s => s.totalItems());
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [featured, setFeatured] = useState<Recolte | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    let q = supabase
      .from('recoltes')
      .select('*, profiles(nom_complet, telephone, zone, note_moyenne)')
      .eq('statut', 'disponible')
      .order('created_at', { ascending: false })
      .limit(20);
    if (category) q = q.eq('type_produit', category);
    if (search) q = q.ilike('type_produit', `%${search}%`);
    const { data } = await q;
    const all = data ?? [];
    setFeatured(all[0] ?? null);
    setRecoltes(all.slice(1));
    setLoading(false);
    setRefreshing(false);
  }, [category, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.location}>📍 Côte d'Ivoire</Text>
          <Text style={s.brand}>AgroMarket</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/ai-assistant')}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/cart')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {totalItems > 0 && <View style={s.badge}><Text style={s.badgeText}>{totalItems}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={recoltes}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#2d5a3d" />}
        ListHeaderComponent={
          <>
            <View style={s.searchWrap}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput style={s.searchInput} placeholder="Rechercher un produit..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
            </View>

            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={i => i.key ?? 'all'}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={[s.chip, category === item.key && s.chipActive]} onPress={() => setCategory(item.key)}>
                  <Text style={[s.chipText, category === item.key && s.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />

            {featured && (
              <TouchableOpacity style={s.banner} onPress={() => router.push(`/listing/${featured.id}`)}>
                <View style={s.bannerBadge}><Text style={s.bannerBadgeText}>🏷️ OFFRE DU JOUR</Text></View>
                <Text style={s.bannerTitle}>{featured.type_produit} — {featured.prix_fcfa_kg.toLocaleString()} FCFA/kg</Text>
                <Text style={s.bannerSub}>{featured.quantite_kg} kg disponibles · {(featured as any).profiles?.zone ?? ''}</Text>
                <View style={s.bannerBtn}><Text style={s.bannerBtnText}>Voir →</Text></View>
              </TouchableOpacity>
            )}

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Annonces récentes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')}>
                <Text style={s.seeAll}>Voir tout →</Text>
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator color="#2d5a3d" style={{ marginTop: 40 }} />}
          </>
        }
        renderItem={({ item }) => <ListingCard recolte={item} onPress={() => router.push(`/listing/${item.id}`)} />}
        ListEmptyComponent={!loading ? <Text style={s.empty}>Aucune annonce trouvée</Text> : null}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  location: { fontSize: 12, color: '#888' },
  brand: { fontSize: 22, fontWeight: '800', color: '#1a3a2a' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#e53e3e', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e8e0d0' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#111' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8e0d0' },
  chipActive: { backgroundColor: '#2d5a3d', borderColor: '#2d5a3d' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  banner: { marginHorizontal: 16, borderRadius: 16, backgroundColor: '#2d5a3d', padding: 20, marginBottom: 20, minHeight: 120, justifyContent: 'flex-end' },
  bannerBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  bannerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bannerTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 12 },
  bannerBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  bannerBtnText: { color: '#2d5a3d', fontWeight: '700', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a3a2a' },
  seeAll: { fontSize: 13, color: '#2d5a3d', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});
