import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Recolte, CATEGORY_EMOJI } from '../lib/supabase';

interface Props {
  recolte: Recolte;
  onPress: () => void;
  badge?: 'POPULAIRE' | 'CERTIFIÉ';
}

const BADGE_COLORS: Record<string, string> = {
  POPULAIRE: '#e67e22',
  CERTIFIÉ: '#2d6a4f',
};

export default function ListingCard({ recolte, onPress, badge }: Props) {
  const emoji = CATEGORY_EMOJI[recolte.type_produit?.toLowerCase()] ?? '📦';

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      <View style={s.imageWrap}>
        {recolte.photo_url ? (
          <Image source={{ uri: recolte.photo_url }} style={s.image} />
        ) : (
          <View style={[s.image, s.placeholder]}>
            <Text style={{ fontSize: 38 }}>{emoji}</Text>
          </View>
        )}
        {badge && (
          <View style={[s.badge, { backgroundColor: BADGE_COLORS[badge] }]}>
            <Text style={s.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <Text style={s.title} numberOfLines={2}>{recolte.type_produit}</Text>
        <Text style={s.price}>{recolte.prix_fcfa_kg.toLocaleString()} FCFA/sac</Text>
        <View style={s.footer}>
          <Text style={s.zone} numberOfLines={1}>📍 {recolte.profiles?.zone ?? 'CI'}</Text>
          {recolte.qualite_score != null && (
            <View style={s.ratingWrap}>
              <Text style={s.star}>⭐</Text>
              <Text style={s.rating}>{recolte.qualite_score.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 110 },
  placeholder: { backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  body: { padding: 10 },
  title: { fontSize: 13, fontWeight: '700', color: '#1a3a2a', marginBottom: 3, lineHeight: 18 },
  price: { fontSize: 13, fontWeight: '800', color: '#2d6a4f', marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zone: { fontSize: 11, color: '#888', flex: 1 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: 11 },
  rating: { fontSize: 11, fontWeight: '700', color: '#555' },
});
