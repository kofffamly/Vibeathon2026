import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { Listing } from '@/data/mockData';

const BADGE_COLORS: Record<string, string> = {
  récoltes: '#D97706',
  animaux:  '#7C3AED',
  intrants: '#059669',
  résidus:  '#0284C7',
};

interface Props {
  listing: Listing;
  onPress: () => void;
}

export default function ListingCard({ listing, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageBox}>
        <Image source={{ uri: listing.image }} style={styles.image} />
        {listing.badge && (
          <View style={[styles.badge, { backgroundColor: BADGE_COLORS[listing.category] }]}>
            <Text style={styles.badgeText}>{listing.badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>

        <Text style={styles.price}>
          {listing.price}{' '}
          <Text style={styles.unit}>{listing.unit}</Text>
        </Text>

        <View style={styles.footer}>
          <Text style={styles.location}>📍 {listing.location}</Text>
          <View style={styles.rating}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>{listing.sellerRating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.fg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageBox: { height: 110, backgroundColor: Colors.muted, position: 'relative' },
  image:    { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  badgeText:  { color: Colors.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  info:       { padding: 10, paddingBottom: 12 },
  title:      { fontSize: 13, fontWeight: '700', color: Colors.fg, lineHeight: 18, marginBottom: 4 },
  price:      { fontSize: 14, fontWeight: '800', color: Colors.primary, marginBottom: 6 },
  unit:       { fontSize: 11, fontWeight: '600', color: Colors.mutedFg },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location:   { fontSize: 11, color: Colors.mutedFg, fontWeight: '500', flex: 1 },
  rating:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star:       { color: Colors.accent, fontSize: 12 },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.fg },
});
