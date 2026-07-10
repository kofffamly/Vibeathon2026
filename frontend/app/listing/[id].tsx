import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LISTINGS } from '@/data/mockData';
import StarRating from '@/components/StarRating';
import { useCartStore } from '@/store/cartStore';

const BADGE_COLORS: Record<string, string> = {
  récoltes: '#D97706',
  animaux:  '#7C3AED',
  intrants: '#059669',
  résidus:  '#0284C7',
};

export default function ListingDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const listing  = LISTINGS.find(l => l.id === id);
  const addItem  = useCartStore(s => s.addItem);
  const items    = useCartStore(s => s.items);
  const [added, setAdded] = useState(false);

  const inCart = items.some(i => i.listing.id === id);

  if (!listing) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Annonce introuvable</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addItem(listing);
    setAdded(true);
    setTimeout(() => router.push('/(tabs)/cart'), 800);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Image ── */}
        <View style={styles.imageBox}>
          <Image source={{ uri: listing.image }} style={styles.image} />
          {listing.badge && (
            <View style={[styles.badge, { backgroundColor: BADGE_COLORS[listing.category] }]}>
              <Text style={styles.badgeText}>{listing.badge}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={Colors.fg} />
          </TouchableOpacity>
        </View>

        {/* ── Infos principales ── */}
        <View style={styles.body}>
          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {listing.price}{' '}
              <Text style={styles.unit}>{listing.unit}</Text>
            </Text>
            <StarRating rating={listing.sellerRating} size="md" showCount />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={14} color={Colors.mutedFg} />
              <Text style={styles.metaText}>{listing.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="tag" size={14} color={Colors.mutedFg} />
              <Text style={styles.metaText}>{listing.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── Vendeur ── */}
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>V</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>Vendeur vérifié</Text>
              <Text style={styles.sellerSub}>Membre depuis 2022 · Réponse rapide</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnContact} onPress={() => router.push('/ai-assistant')}>
          <Text style={styles.btnContactText}>💬 Contacter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnBuy, (added || inCart) && styles.btnBuyDone]}
          onPress={handleAddToCart}
          disabled={added || inCart}
          activeOpacity={0.85}
        >
          <Text style={styles.btnBuyText}>
            {added || inCart ? '✅ Ajouté au panier' : 'Ajouter au panier'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: Colors.bg },
  notFound:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: Colors.fg, fontWeight: '600' },
  backLink:  { fontSize: 14, color: Colors.primary, fontWeight: '700' },

  imageBox:  { height: 280, backgroundColor: Colors.muted, position: 'relative' },
  image:     { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', bottom: 14, left: 14,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  backBtn: {
    position: 'absolute', top: 14, left: 14,
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },

  body:      { padding: 20 },
  title:     { fontSize: 20, fontWeight: '800', color: Colors.fg, lineHeight: 28, marginBottom: 12 },
  priceRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  price:     { fontSize: 22, fontWeight: '800', color: Colors.primary },
  unit:      { fontSize: 14, fontWeight: '600', color: Colors.mutedFg },
  metaRow:   { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metaItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:  { fontSize: 13, color: Colors.mutedFg, fontWeight: '500', textTransform: 'capitalize' },
  divider:   { height: 1, backgroundColor: Colors.border, marginBottom: 20 },

  sellerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  sellerAvatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sellerInitial: { fontSize: 18, fontWeight: '800', color: Colors.white },
  sellerInfo:    { flex: 1 },
  sellerName:    { fontSize: 14, fontWeight: '700', color: Colors.fg },
  sellerSub:     { fontSize: 12, color: Colors.mutedFg, marginTop: 2 },
  contactBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  contactBtnText: { fontSize: 18 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingBottom: 28, paddingTop: 12,
    backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  btnContact: {
    flex: 1, paddingVertical: 14, borderRadius: 28,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnContactText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  btnBuy: {
    flex: 2, paddingVertical: 14, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnBuyDone:  { backgroundColor: Colors.success },
  btnBuyText:  { fontSize: 14, fontWeight: '800', color: Colors.white },
});
