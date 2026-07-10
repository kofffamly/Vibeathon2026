import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { useListingStore } from '@/store/listingStore';

const FILTRES = [
  { label: 'Tout',     emoji: '🌍' },
  { label: 'Récoltes', emoji: '🌽' },
  { label: 'Animaux',  emoji: '🐄' },
  { label: 'Intrants', emoji: '🌱' },
];

const ANNONCES = [
  {
    id: '1', titre: 'Maïs local — récolte 2024', prix: '1 200 FCFA/sac',
    localisation: 'Korhogo', note: 4.8, badge: 'POPULAIRE',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '2', titre: 'Bœufs zébus — race locale', prix: '180 000 FCFA/tête',
    localisation: 'Bouaké', note: 4.6, badge: null,
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '3', titre: 'Engrais NPK certifié', prix: '25 000 FCFA/sac',
    localisation: 'Abidjan', note: 4.9, badge: 'CERTIFIÉ',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '4', titre: 'Champ de riz — coucher', prix: '3 500 FCFA/botte',
    localisation: 'Yamoussoukro', note: 4.5, badge: null,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format',
  },
];

export default function Marche() {
  const router        = useRouter();
  const totalItems    = useCartStore(s => s.totalItems)();
  const userListings  = useListingStore(s => s.listings);
  const [filtre, setFiltre] = useState('Tout');
  const [search, setSearch] = useState('');

  const allAnnonces = [
    ...userListings.map(l => ({
      id: l.id, titre: l.title, prix: `${l.price}${l.unit}`,
      localisation: l.location, note: l.sellerRating,
      badge: null as string | null, image: l.image,
    })),
    ...ANNONCES,
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={13} color="#F59E0B" />
              <Text style={styles.locText}>Côte d'Ivoire</Text>
            </View>
            <Text style={styles.logo}>AgroMarket</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/ai-assistant')}>
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/cart')}>
              <Feather name="shopping-cart" size={18} color="#1B4332" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Barre de recherche ── */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit, un vendeur..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Filtres ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={styles.filtresContent}>
          {FILTRES.map(f => (
            <TouchableOpacity
              key={f.label}
              style={[styles.filtre, filtre === f.label && styles.filtreActive]}
              onPress={() => setFiltre(f.label)}
            >
              <Text style={{ fontSize: 13, marginRight: 4 }}>{f.emoji}</Text>
              <Text style={[styles.filtreText, filtre === f.label && styles.filtreTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Offre du jour ── */}
        <TouchableOpacity style={styles.offreCard} activeOpacity={0.9} onPress={() => router.push('/listing/1' as any)}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=300&fit=crop&auto=format' }}
            style={StyleSheet.absoluteFillObject as any}
          />
          <View style={styles.offreOverlay} />
          <View style={styles.offreBadge}>
            <Text style={styles.offreBadgeText}>🌟 OFFRE DU JOUR</Text>
          </View>
          <Text style={styles.offreTitre}>Maïs local — 1 200 FCFA/sac</Text>
          <Text style={styles.offreSub}>50 sacs disponibles · Korhogo</Text>
          <View style={styles.offreBtn}>
            <Text style={styles.offreBtnText}>Voir →</Text>
          </View>
        </TouchableOpacity>

        {/* ── Annonces récentes ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Annonces récentes</Text>
          <TouchableOpacity>
            <Text style={styles.voirTout}>Voir tout →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {allAnnonces.filter(a => filtre === 'Tout' || a.titre.toLowerCase().includes(filtre.toLowerCase()) || (filtre === 'Récoltes' && a.id === '1') || (filtre === 'Animaux' && a.id === '2') || (filtre === 'Intrants' && a.id === '3')).map(a => (
            <TouchableOpacity key={a.id} style={styles.card} onPress={() => router.push(`/listing/${a.id}` as any)}>
              <View style={styles.cardImgWrap}>
                <Image source={{ uri: a.image }} style={styles.cardImg} />
                {a.badge && (
                  <View style={[styles.cardBadge, a.badge === 'CERTIFIÉ' && styles.cardBadgeCertifie]}>
                    <Text style={styles.cardBadgeText}>{a.badge}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitre} numberOfLines={2}>{a.titre}</Text>
                <Text style={styles.cardPrix}>{a.prix}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.cardLoc}>
                    <Ionicons name="location-sharp" size={11} color="#9CA3AF" />
                    <Text style={styles.cardLocText}>{a.localisation}</Text>
                  </View>
                  <View style={styles.cardNote}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.cardNoteText}>{a.note}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { fontSize: 12, color: '#6B7280' },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#1B4332' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  cartBadge: { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 20, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  filtresContent: { paddingHorizontal: 20, gap: 8 },
  filtre: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#fff' },
  filtreActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  filtreText: { fontSize: 13, color: '#1B4332', fontWeight: '500' },
  filtreTextActive: { color: '#fff', fontWeight: '700' },

  offreCard: { marginHorizontal: 20, marginBottom: 20, borderRadius: 16, overflow: 'hidden', height: 140, padding: 16, justifyContent: 'flex-end' },
  offreOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,31,16,0.6)' },
  offreBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  offreBadgeText: { color: '#FCD34D', fontSize: 11, fontWeight: '700' },
  offreTitre: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  offreSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  offreBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'flex-start' },
  offreBtnText: { color: '#1B4332', fontWeight: '700', fontSize: 13 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  voirTout: { fontSize: 13, color: '#1B4332', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  cardImgWrap: { height: 100 },
  cardImg: { width: '100%', height: '100%' },
  cardBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#F59E0B', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  cardBadgeCertifie: { backgroundColor: '#22C55E' },
  cardBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { padding: 10 },
  cardTitre: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 3, lineHeight: 16 },
  cardPrix: { fontSize: 12, fontWeight: 'bold', color: '#1B4332', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLoc: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardLocText: { fontSize: 10, color: '#9CA3AF' },
  cardNote: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardNoteText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
});
