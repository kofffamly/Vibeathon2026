import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

const STATS = [
  { icon: '🌾', val: '12', label: 'Annonces' },
  { icon: '📦', val: '48', label: 'Ventes' },
  { icon: '⭐', val: '4.8', label: 'Note' },
  { icon: '📅', val: '2 ans', label: 'Membre' },
];

const ANNONCES = [
  { id: '1', emoji: '🌽', titre: 'Maïs local — récolte 2024', prix: '1 200 FCFA/kg', vues: 42 },
  { id: '2', emoji: '🌾', titre: 'Paille de riz séchée', prix: '3 500 FCFA/botte', vues: 18 },
];

const SECTIONS = [
  { bg: '#FEF9C3', icon: '⭐', label: 'Mes avis', sub: '4.8 · 23 avis' },
  { bg: '#DCFCE7', icon: '🤖', label: 'Assistant IA', sub: 'Conseils agricoles' },
  { bg: '#FEE2E2', icon: '🔔', label: 'Notifications', sub: '2 non lues' },
  { bg: '#DBEAFE', icon: '📍', label: 'Localisation', sub: "Bouaké, Côte d'Ivoire" },
  { bg: '#F3F4F6', icon: '🔒', label: 'Sécurité', sub: 'Mot de passe, 2FA' },
  { bg: '#EDE9FE', icon: '❓', label: 'Aide & Support', sub: 'FAQ, contact' },
];

export default function Profil() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Mon profil</Text>
          <TouchableOpacity style={styles.btnModifier}>
            <Text style={styles.btnModifierText}>✏  Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* ── Carte identité ── */}
        <View style={styles.identiteCard}>
          <View style={styles.avatar}>
            <Text style={styles.initiales}>{user ? user.nom.slice(0, 2).toUpperCase() : '??'}</Text>
          </View>
          <View style={styles.identiteInfo}>
            <Text style={styles.nom}>{user?.nom ?? 'Invité'}</Text>
            <Text style={styles.role}>{user ? user.role.join(' · ') : 'Utilisateur non connecté'}</Text>
            <View style={styles.locRow}>
              <Text style={styles.locIcon}>📍</Text>
              <Text style={styles.locText}>{user?.localisation ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsCard}>
          {STATS.map(({ icon, val, label }, i) => (
            <View key={label} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
              <Text style={styles.statIcon}>{icon}</Text>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Mes annonces ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes annonces</Text>
            <TouchableOpacity>
              <Text style={styles.voirTout}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {ANNONCES.map(({ id, emoji, titre, prix, vues }) => (
            <View key={id} style={styles.annonceCard}>
              <View style={styles.annonceImg}>
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </View>
              <View style={styles.annonceInfo}>
                <Text style={styles.annonceTitre}>{titre}</Text>
                <Text style={styles.annoncePrix}>{prix}</Text>
                <Text style={styles.annonceVues}>👁 {vues} vues</Text>
              </View>
              <View style={styles.annonceRight}>
                <View style={styles.badgeActif}>
                  <Text style={styles.badgeActifText}>Actif</Text>
                </View>
                <TouchableOpacity style={styles.btnGerer}>
                  <Text style={styles.btnGererText}>Gérer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ── Sections ── */}
        <View style={styles.sectionsCard}>
          {SECTIONS.map(({ bg, icon, label, sub }) => (
            <TouchableOpacity key={label} style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: bg }]}>
                <Text style={styles.rowIcon}>{icon}</Text>
              </View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowSub}>{sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Déconnexion */}
          <TouchableOpacity style={styles.row} onPress={user ? handleLogout : () => router.replace('/auth/login')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.rowIcon}>🚪</Text>
            </View>
            <View style={styles.rowTexts}>
              <Text style={[styles.rowLabel, { color: '#EF4444' }]}>{user ? 'Déconnexion' : 'Se connecter'}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F0' },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  btnModifier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  btnModifierText: { color: '#1B4332', fontWeight: '600', fontSize: 13 },

  /* Identité */
  identiteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatar: {
    width: 64, height: 64,
    borderRadius: 14,
    backgroundColor: '#1B4332',
    alignItems: 'center', justifyContent: 'center',
  },
  initiales: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  identiteInfo: { flex: 1 },
  nom: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  locIcon: { fontSize: 12 },
  locText: { fontSize: 12, color: '#6B7280' },

  /* Stats */
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: '#F3F4F6' },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statVal: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  /* Mes annonces */
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  voirTout: { fontSize: 13, color: '#1B4332', fontWeight: '600' },
  annonceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  annonceImg: {
    width: 60, height: 60,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center', justifyContent: 'center',
  },
  annonceInfo: { flex: 1 },
  annonceTitre: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  annoncePrix: { fontSize: 13, color: '#1B4332', fontWeight: '600' },
  annonceVues: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  annonceRight: { alignItems: 'flex-end', gap: 8 },
  badgeActif: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeActifText: { fontSize: 11, color: '#16A34A', fontWeight: '700' },
  btnGerer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnGererText: { fontSize: 12, color: '#1A1A1A', fontWeight: '500' },

  /* Sections */
  sectionsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 12,
  },
  iconCircle: {
    width: 38, height: 38,
    borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  rowIcon: { fontSize: 17 },
  rowTexts: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  chevron: { fontSize: 20, color: '#D1D5DB' },
});
