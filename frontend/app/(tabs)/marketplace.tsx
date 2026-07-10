import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, Image, StyleSheet, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { LISTINGS, CATEGORIES } from '@/data/mockData';
import ListingCard from '@/components/ListingCard';
import CategoryChip from '@/components/CategoryChip';

export default function MarketplaceScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = LISTINGS.filter(l => {
    const matchCat = activeCategory === 'all' || l.category === activeCategory;
    const matchSrch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.loc}>📍 Côte d'Ivoire</Text>
              <Text style={styles.logo}>
                Agro<Text style={{ color: Colors.accentLight }}>Market</Text>
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push('/ai-assistant')}
              >
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="bell" size={18} color={Colors.white} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={Colors.mutedFg} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un produit, un vendeur..."
              placeholderTextColor={Colors.mutedFg}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.key}
              emoji={cat.emoji}
              label={cat.label}
              active={activeCategory === cat.key}
              onPress={() => setActiveCategory(cat.key)}
            />
          ))}
        </ScrollView>

        {/* Featured Banner */}
        {activeCategory === 'all' && !search && (
          <TouchableOpacity
            style={styles.banner}
            activeOpacity={0.9}
            onPress={() => router.push(`/listing/${LISTINGS[0].id}`)}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=300&fit=crop&auto=format' }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={['rgba(13,31,16,0.75)', 'rgba(13,31,16,0.2)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerBadge}>🔥 Offre du jour</Text>
              <Text style={styles.bannerTitle}>Maïs local — 1 200 FCFA/sac</Text>
              <Text style={styles.bannerSub}>50 sacs disponibles · Korhogo</Text>
            </View>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnTxt}>Voir →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {search ? `${filtered.length} résultat(s)` : 'Annonces récentes'}
            </Text>
            <Text style={styles.seeAll}>Voir tout →</Text>
          </View>

          <View style={styles.grid}>
            {filtered.map(listing => (
              <View key={listing.id} style={styles.gridItem}>
                <ListingCard
                  listing={listing}
                  onPress={() => router.push(`/listing/${listing.id}`)}
                />
              </View>
            ))}
          </View>

          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySub}>Essayez un autre terme</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  loc:         { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 2 },
  logo:        { fontSize: 22, fontWeight: '700', color: Colors.white },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  searchInput:   { flex: 1, fontSize: 13, color: Colors.fg, fontWeight: '500' },
  categories:    { paddingHorizontal: 20, paddingVertical: 16 },
  banner: {
    marginHorizontal: 20, height: 130, borderRadius: 18,
    overflow: 'hidden', marginBottom: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bannerContent: { padding: 14 },
  bannerBadge:   { fontSize: 11, color: Colors.accentLight, fontWeight: '700', marginBottom: 3 },
  bannerTitle:   { fontSize: 16, fontWeight: '800', color: Colors.white },
  bannerSub:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  bannerBtn: {
    margin: 14, backgroundColor: Colors.accent,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
  },
  bannerBtnTxt:  { color: Colors.white, fontSize: 12, fontWeight: '800' },
  section:       { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '800', color: Colors.fg },
  seeAll:        { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem:      { width: '47.5%' },
  empty:         { alignItems: 'center', paddingVertical: 40 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: Colors.fg },
  emptySub:      { fontSize: 13, color: Colors.mutedFg, marginTop: 4 },
});
