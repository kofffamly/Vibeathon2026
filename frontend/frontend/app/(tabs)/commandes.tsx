import { View, Text, StyleSheet } from 'react-native';

export default function Commandes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>
      <Text style={styles.subtitle}>Aucune commande pour l'instant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F0', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#6B7280' },
});
