import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ImageBackground, Animated, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase, Recolte } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import ListingCard from '../../components/ListingCard';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 12) / 2;

// ── Onglets principaux ──────────────────────────────────────
const TABS = [
  { key: 'all',    label: 'Tout',     emoji: '' },
  { key: 'mine',   label: 'Mes annonces', emoji: '👤' },
  { key: 'riz',    label: 'Récoltes', emoji: '🌾' },
  { key: 'animal', label: 'Animaux',  emoji: '🐄' },
  { key: 'mais',   label: 'Céréales', emoji: '🌽' },
  { key: 'tomate', label: 'Légumes',  emoji: '🍅' },
  { key: 'cacao',  label: 'Cacao',    emoji: '🍫' },
];

// ── Skeleton ────────────────────────────────────────────────
function SkeletonCard() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[sk.card, { opacity: anim }]}>
      <View style={sk.img} />
      <View style={sk.line1} />
      <View style={sk.line2} />
    </Animated.View>
  );
}

// ── Composant principal ─────────────────────────────────────
export default function Marketplace() {
  const router  = useRouter();
  const { session } = useAuthStore();

  const [recoltes,  setRecoltes]  = useState<Recolte[]>([]);
  const [featured,  setFeatured]  = useState<Recolte | null>(null);
  const [search,    setSearch]    = useState('');
  const [tabIndex,  setTabIndex]  = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  // Indicateur animé
  const indicatorX  = useRef(new Animated.Value(0)).current;
  const tabOffsets  = useRef<number[]>([]);

  const moveIndicator = (i: number) => {
    Animated.spring(indicatorX, {
      toValue: tabOffsets.current[i] ?? 0,
      useNativeDriver: Platform.OS !== 'web', tension: 60, friction: 10,
    }).start();
  };

  const selectTab = (i: number) => { setTabIndex(i); moveIndicator(i); };

  const tabKey = TABS[tabIndex].key;

  const load = useCallback(async () => {
    setLoading(true);
    const uid = session?.user.id;

    let q = supabase
      .from('recoltes')
      .select('*')
      .order('created_at', { ascending: false });

    if (tabKey === 'mine') {
      // Mes propres annonces (tous statuts)
      if (uid) q = q.eq('agriculteur_id', uid);
    } else {
      // Marché : disponibles et besoins
      q = q.in('statut', ['disponible', 'besoin']);
      // Ne plus exclure les propres annonces de l'utilisateur pour qu'elles s'affichent
      if (tabKey !== 'all') q = q.ilike('type_produit', `%${tabKey}%`);
    }

    if (search) q = q.ilike('type_produit', `%${search}%`);

    const { data, error } = await q;
    setDebugInfo(error ? `Erreur: ${error.message}` : `${data?.length ?? 0} annonce(s)`);
    const list = (data ?? []) as Recolte[];
    setFeatured(tabKey !== 'mine' ? (list[0] ?? null) : null);
    setRecoltes(list);
    setLoading(false);
  }, [tabKey, search, session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ── Header de liste ──
  const ListHeader = () => (
    <>
      {featured && tabKey !== 'mine' && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/listing/${featured.id}`)}
          style={s.banner}
        >
          <ImageBackground
            source={featured.photo_url ? { uri: featured.photo_url } : undefined}
            style={s.bannerBg}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={s.bannerOverlay}>
              <View style={s.bannerTag}>
                <Text style={s.bannerTagText}>🌟 OFFRE DU JOUR</Text>
              </View>
              <Text style={s.bannerTitle}>
                {featured.type_produit} — {featured.prix_fcfa_kg.toLocaleString()} FCFA/kg
              </Text>
              <Text style={s.bannerSub}>{featured.quantite_kg} kg disponibles</Text>
              <View style={s.bannerBtn}>
                <Text style={s.bannerBtnText}>Voir →</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>
          {tabKey === 'mine' ? '🌾 Mes annonces publiées' : 'Annonces récentes'}
        </Text>
        <TouchableOpacity onPress={load}>
          <Text style={s.seeAll}>↻ Actualiser</Text>
        </TouchableOpacity>
      </View>
      {/* Debug temporaire */}
      {__DEV__ && <Text style={{ fontSize: 10, color: '#aaa', marginBottom: 8 }}>{debugInfo}</Text>}
    </>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.location}>📍 Côte d'Ivoire</Text>
          <Text style={s.brand}>AgroMarket</Text>
        </View>
        <TouchableOpacity style={s.iconBtn}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={load}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: '#aaa', fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Onglets */}
      <View style={s.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsScroll}
        >
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab.key}
              style={s.tab}
              onPress={() => selectTab(i)}
              onLayout={e => {
                tabOffsets.current[i] = e.nativeEvent.layout.x;
                if (i === 0) moveIndicator(0);
              }}
            >
              <Text style={[s.tabText, tabIndex === i && s.tabTextActive]}>
                {tab.emoji ? `${tab.emoji} ` : ''}{tab.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View style={[s.tabIndicator, { transform: [{ translateX: indicatorX }] }]} />
        </ScrollView>
      </View>

      {/* Contenu */}
      {loading ? (
        <>
          <View style={s.skBanner} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 }}>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </View>
        </>
      ) : (
        <FlatList
          data={featured && tabKey !== 'mine' ? recoltes.slice(1) : recoltes}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ListHeader />}
          renderItem={({ item, index }) => (
            <ListingCard
              recolte={item}
              badge={tabKey !== 'mine' && index === 0 ? 'POPULAIRE' : tabKey !== 'mine' && index === 2 ? 'CERTIFIÉ' : undefined}
              onPress={() => router.push(`/listing/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>
                {tabKey === 'mine' ? '📋' : '🌾'}
              </Text>
              <Text style={s.empty}>
                {tabKey === 'mine'
                  ? 'Vous n\'avez pas encore publié d\'annonce'
                  : 'Aucune annonce dans cette catégorie'}
              </Text>
              {tabKey === 'mine' && (
                <TouchableOpacity
                  style={s.publishBtn}
                  onPress={() => router.push('/(tabs)/publish')}
                >
                  <Text style={s.publishBtnText}>+ Publier une annonce</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const sk = StyleSheet.create({
  card:  { width: CARD_W, backgroundColor: '#e8e4dc', borderRadius: 14, overflow: 'hidden' },
  img:   { width: '100%', height: 110, backgroundColor: '#ddd8ce' },
  line1: { height: 12, backgroundColor: '#ddd8ce', borderRadius: 6, margin: 10, marginBottom: 6 },
  line2: { height: 10, backgroundColor: '#ddd8ce', borderRadius: 6, marginHorizontal: 10, width: '60%', marginBottom: 10 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f5f0' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 },
  location: { fontSize: 11, color: '#888' },
  brand: { fontSize: 22, fontWeight: '900', color: '#1a3a2a', letterSpacing: -0.5 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 1 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, height: 46, elevation: 1 },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  tabsWrap: { marginBottom: 14 },
  tabsScroll: { paddingHorizontal: 16, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 8 },
  tabText: { fontSize: 13, color: '#999', fontWeight: '600' },
  tabTextActive: { color: '#1a3a2a', fontWeight: '800' },
  tabIndicator: { position: 'absolute', bottom: 0, height: 3, width: 40, backgroundColor: '#2d6a4f', borderRadius: 2 },

  skBanner: { marginHorizontal: 16, height: 160, backgroundColor: '#e0dbd0', borderRadius: 16, marginBottom: 20 },

  banner: { marginBottom: 20, borderRadius: 16, overflow: 'hidden', height: 160, elevation: 3 },
  bannerBg: { flex: 1, backgroundColor: '#2d6a4f' },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(20,50,30,0.6)', padding: 16, justifyContent: 'flex-end' },
  bannerTag: { backgroundColor: '#f59e0b', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  bannerTagText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  bannerTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  bannerBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  bannerBtnText: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1a3a2a' },
  seeAll: { fontSize: 13, color: '#2d6a4f', fontWeight: '600' },

  row: { gap: 12, marginBottom: 12 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  empty: { fontSize: 15, color: '#aaa', textAlign: 'center', marginBottom: 20 },
  publishBtn: { backgroundColor: '#2d6a4f', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  publishBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
