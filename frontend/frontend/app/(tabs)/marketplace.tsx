import { View, Text, FlatList, StyleSheet } from 'react-native';

const PRODUITS = [
  { id: '1', nom: 'Tomates fraîches', vendeur: 'Koné Amadou', prix: '6 000 FCFA' },
  { id: '2', nom: 'Maïs en sac 50kg', vendeur: 'Diallo Fatou', prix: '18 000 FCFA' },
  { id: '3', nom: 'Engrais NPK', vendeur: 'AgroShop CI', prix: '25 000 FCFA' },
];

export default function Marketplace() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marché</Text>
      <FlatList
        data={PRODUITS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.nom}>{item.nom}</Text>
              <Text style={styles.vendeur}>{item.vendeur}</Text>
            </View>
            <Text style={styles.prix}>{item.prix}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F0', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, marginTop: 48 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#D1FAE5', marginRight: 12 },
  info: { flex: 1 },
  nom: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  vendeur: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  prix: { fontSize: 14, fontWeight: 'bold', color: '#1B4332' },
});
