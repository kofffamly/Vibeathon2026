import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/store/api';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';

const FILTRES = ['Tout', 'Récoltes', 'Animaux', 'Intrants', 'Services'];

export default function Marketplace() {
  const addItem = useCartStore(s => s.addItem);
  const [produits, setProduits] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('Tout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: Record<string, string> = {};
      if (search) query.q = search;
      if (filtre !== 'Tout') query.category = filtre;
      const data = await api.getProducts(query);
      setProduits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les produits');
    }
    setLoading(false);
  };

  useEffect(() => {
    chargerProduits();
  }, [search, filtre]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Marché</Text>
        <Text style={styles.subtitle}>Recherchez et filtrez les offres agricoles</Text>
      </View>

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

      <View style={styles.filtersRow}>
        {FILTRES.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFiltre(item)}
            style={[styles.filterButton, filtre === item && styles.filterActive]}
          >
            <Text style={[styles.filterText, filtre === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? <Text style={styles.loadingText}>Chargement...</Text> : null}

      <FlatList
        data={produits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.thumb}>
              <Text style={styles.thumbEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.nom}>{item.titre}</Text>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.location}>📍 {item.localisation}</Text>
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.prix}>{item.prixUnit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addItem({ id: item.id, nom: item.titre, localisation: item.localisation, prixUnit: item.prixUnit, emoji: item.emoji })}>
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Aucun produit trouvé.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F0' },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4332' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginTop: 14, marginBottom: 12 },
  filterButton: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  filterActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  filterText: { fontSize: 12, color: '#1B4332' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  thumb: { width: 60, height: 60, borderRadius: 14, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  thumbEmoji: { fontSize: 26 },
  info: { flex: 1 },
  rightColumn: { alignItems: 'flex-end', justifyContent: 'space-between' },
  nom: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  description: { fontSize: 12, color: '#6B7280', marginBottom: 6, maxWidth: 120 },
  location: { fontSize: 11, color: '#9CA3AF' },
  prix: { fontSize: 14, fontWeight: '700', color: '#1B4332', marginBottom: 10 },
  addButton: { backgroundColor: '#1B4332', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 48, color: '#6B7280' },
  loadingText: { textAlign: 'center', marginTop: 24, color: '#6B7280' },
  errorText: { textAlign: 'center', marginTop: 12, color: '#EF4444' },
});
