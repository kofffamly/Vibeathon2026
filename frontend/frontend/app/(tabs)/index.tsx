import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';

const FILTRES = ['Tout', 'Récoltes', 'Animaux', 'Intrants', 'Services'];

const ANNONCES = [
  {
    id: '1', titre: 'Maïs local — récolte 2024', prix: '1 200 FCFA/sac',
    localisation: 'Korhogo', note: 4.8, badge: 'POPULAIRE', emoji: '🌽', bg: '#D4A853',
  },
  {
    id: '2', titre: 'Bœufs zébus — race locale', prix: '180 000 FCFA/tête',
    localisation: 'Bouaké', note: 4.6, badge: null, emoji: '🐄', bg: '#E8E0D0',
  },
  {
    id: '3', titre: 'Engrais NPK certifié', prix: '25 000 FCFA/sac',
    localisation: 'Abidjan', note: 4.9, badge: 'CERTIFIÉ', emoji: '🌱', bg: '#2D6A4F',
  },
  {
    id: '4', titre: 'Champ de riz — coucher', prix: '3 500 FCFA/botte',
    localisation: 'Yamoussoukro', note: 4.5, badge: null, emoji: '🌾', bg: '#C8A96E',
  },
];

export default function Marche() {
  const totalItems = useCartStore(s => s.totalItems);
  const [filtre, setFiltre] = require('react').useState('Tout');
  const [search, setSearch] = require('react').useState('');

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={13} color="#F59E0B" />
              <Text style={styles.locText}>Côte d'Ivoire</Text>
            </View>
            <Text style={styles.logo}>AgroMarket</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="grid-outline" size={22} color="#1B4332" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#1B4332" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Barre de recherche ── */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit, un vendeur..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Filtres ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll} contentContainerStyle={styles.filtresContent}>
          {FILTRES.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtre, filtre === f && styles.filtreActive]}
              onPress={() => setFiltre(f)}
            >
              {f === 'Tout' && <Ionicons name="apps-outline" size={13} color={filtre === f ? '#fff' : '#1B4332'} style={{ marginRight: 4 }} />}
              <Text style={[styles.filtreText, filtre === f && styles.filtreTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Offre du jour ── */}
        <View style={styles.offreCard}>
          <View style={styles.offreBadge}>
            <Text style={styles.offreBadgeText}>🌟 OFFRE DU JOUR</Text>
          </View>
          <Text style={styles.offreTitre}>Maïs local — 1 200 FCFA/sac</Text>
          <Text style={styles.offreSub}>50 sacs disponibles · Korhogo</Text>
          <TouchableOpacity style={styles.offreBtn}>
            <Text style={styles.offreBtnText}>Voir →</Text>
          </TouchableOpacity>
          <Text style={styles.offreEmoji}>🌽</Text>
        </View>

        {/* ── Annonces récentes ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Annonces récentes</Text>
          <TouchableOpacity>
            <Text style={styles.voirTout}>Voir tout →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {ANNONCES.map(a => (
            <TouchableOpacity key={a.id} style={styles.card}>
              <View style={[styles.cardImg, { backgroundColor: a.bg }]}>
                <Text style={styles.cardEmoji}>{a.emoji}</Text>
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

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerLeft: {},
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { fontSize: 12, color: '#6B7280' },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#1B4332' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },

  /* Recherche */
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 20, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  /* Filtres */
  filtresScroll: { marginBottom: 16 },
  filtresContent: { paddingHorizontal: 20, gap: 8 },
  filtre: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#fff' },
  filtreActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  filtreText: { fontSize: 13, color: '#1B4332', fontWeight: '500' },
  filtreTextActive: { color: '#fff', fontWeight: '700' },

  /* Offre du jour */
  offreCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: '#1B4332',
    borderRadius: 16, padding: 20,
    overflow: 'hidden',
    minHeight: 120,
  },
  offreBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  offreBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  offreTitre: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4, maxWidth: '70%' },
  offreSub: { fontSize: 12, color: '#A7F3D0', marginBottom: 14 },
  offreBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, alignSelf: 'flex-start' },
  offreBtnText: { color: '#1B4332', fontWeight: '700', fontSize: 13 },
  offreEmoji: { position: 'absolute', right: 16, bottom: 12, fontSize: 64 },

  /* Section */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  voirTout: { fontSize: 13, color: '#1B4332', fontWeight: '600' },

  /* Grille 2 colonnes */
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  cardImg: { height: 100, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 40 },
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
