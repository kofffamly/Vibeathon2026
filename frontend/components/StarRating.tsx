import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props {
  rating:     number;
  size?:      'sm' | 'md';
  showCount?: boolean;
}

export default function StarRating({ rating, size = 'sm', showCount = false }: Props) {
  const starSize = size === 'md' ? 14 : 11;
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(s => (
        <Text
          key={s}
          style={[styles.star, { fontSize: starSize, color: s <= Math.round(rating) ? Colors.accent : Colors.border }]}
        >
          ★
        </Text>
      ))}
      <Text style={[styles.value, { fontSize: starSize }]}>
        {rating}{showCount ? ' · Vendeur fiable' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star:  {},
  value: { fontWeight: '700', color: Colors.mutedFg, marginLeft: 3 },
});
