import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props {
  emoji:   string;
  label:   string;
  active:  boolean;
  onPress: () => void;
}

export default function CategoryChip({ emoji, label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emoji:       { fontSize: 14 },
  label:       { fontSize: 12, fontWeight: '700', color: Colors.mutedFg },
  labelActive: { color: Colors.white },
});
