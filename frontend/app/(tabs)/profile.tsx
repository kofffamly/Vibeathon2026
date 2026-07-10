import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase, Recolte, CATEGORY_EMOJI, ROLE_LABELS } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function Profile() {
  const { session, profile, logout, updateProfile } = useAuthStore();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [zone, setZone] = useState('');
  const [saving, setSaving] = useState(false);

  const [annonces, setAnnonces] = useState<Recolte[]>([]);
  const [loadingAnnonces, setLoadingAnnonces] = useState(false);
  const [stats, setStats] = useState({ listings: 0, orders: 0 });

  useEffect(() => {
    if (!session) return;
    supabase.from('recoltes')
      .select('id', { count: 'exact', head: true })
      .eq('agriculteur_id', session.user.id)
      .then(({ count, error }) => {
        if (!error) setStats(prev => ({ ...prev, listings: count ?? 0 }));
      });
    supabase.from('missions_transport')
      .select('id', { count: 'exact', head: true })
      .eq('acheteur_id', session.user.id)
      .then(({ count, error }) => {
        if (!error) setStats(prev => ({ ...prev, orders: count ?? 0 }));
      });
    loadAnnonces();
  }, [session]);

  const loadAnnonces = async () => {
    if (!session) return;
    setLoadingAnnonces(true);
    const { data, error } = await supabase
      .from('recoltes')
      .select('*')
      .eq('agriculteur_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error) setAnnonces(data ?? []);
    setLoadingAnnonces(false);
  };

  const startEdit = () => {
    setNom(profile?.nom_complet ?? '');
    setTelephone(profile?.telephone ?? '');
    setZone(profile?.zone ?? '');
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    const err = await updateProfile({ nom_complet: nom, telephone, zone });
    setSaving(false);
    if (err) Alert.alert('Erreur', err);
    else setEditing(false);
  };

  const deleteAnnonce = (id: string) => {
    Alert.alert('Supprimer', 'Confirmer la suppression de cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await supabase.from('recoltes').delete().eq('id', id);
          setAnnonces(prev => prev.filter(a => a.id !== id));
          setStats(prev => ({ ...prev, listings: prev.listings - 1 }));
        },
      },
    ]);
  };

  const initials = profile?.nom_complet?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 90 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Mon profil</Text>
            {!editing ? (
              <TouchableOpacity style={s.editBtn} onPress={startEdit}>
                <Text style={s.editText}>✏️ Modifier</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={s.editBtn} onPress={() => setEditing(false)}>
                <Text style={[s.editText, { color: '#888' }]}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar */}
          <View style={s.profileCard}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            {!editing ? (
              <>
                <Text style={s.name}>{profile?.nom_complet ?? 'Utilisateur'}</Text>
                <Text style={s.role}>{ROLE_LABELS[profile?.role ?? ''] ?? 'Agriculteur'} · {profile?.zone ?? 'Côte d\'Ivoire'}</Text>
                {profile?.telephone && <Text style={s.phone}>📞 {profile.telephone}</Text>}
              </>
            ) : (
              /* Formulaire édition */
              <View style={s.editForm}>
                <Text style={s.fieldLabel}>NOM COMPLET</Text>
                <TextInput style={s.input} value={nom} onChangeText={setNom} placeholder="Votre nom" placeholderTextColor="#bbb" />
                <Text style={s.fieldLabel}>TÉLÉPHONE</Text>
                <TextInput style={s.input} value={telephone} onChangeText={setTelephone} placeholder="+225 07 00 00 00" keyboardType="phone-pad" placeholderTextColor="#bbb" />
                <Text style={s.fieldLabel}>ZONE / VILLE</Text>
                <TextInput style={s.input} value={zone} onChangeText={setZone} placeholder="Ex: Bouaké" placeholderTextColor="#bbb" returnKeyType="done" />
                <TouchableOpacity style={s.saveBtn} onPress={saveProfile} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>💾 Enregistrer</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats */}
          {!editing && (
            <View style={s.statsRow}>
              {[
                { num: stats.listings, label: 'Annonces' },
                { num: stats.orders, label: 'Commandes' },
                { num: profile?.note_moyenne?.toFixed(1) ?? '—', label: 'Note' },
              ].map((st, i) => (
                <View key={i} style={s.statBox}>
                  <Text style={s.statNum}>{st.num}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Mes annonces */}
          {!editing && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>🌾 Mes annonces</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/publish')}>
                  <Text style={s.seeAll}>+ Publier</Text>
                </TouchableOpacity>
              </View>

              {loadingAnnonces ? (
                <ActivityIndicator color="#2d6a4f" style={{ marginTop: 12 }} />
              ) : annonces.length === 0 ? (
                <Text style={s.emptyAnnonces}>Aucune annonce publiée</Text>
              ) : (
                annonces.map(a => (
                  <View key={a.id} style={s.annonceRow}>
                    <Text style={s.annonceEmoji}>{CATEGORY_EMOJI[a.type_produit?.toLowerCase()] ?? '📦'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.annonceTitle} numberOfLines={1}>{a.type_produit}</Text>
                      <Text style={s.annoncePrice}>{a.prix_fcfa_kg.toLocaleString()} FCFA/kg · {a.quantite_kg} kg</Text>
                    </View>
                    <View style={[s.statutDot, { backgroundColor: a.statut === 'disponible' ? '#16a34a' : '#9ca3af' }]} />
                    <TouchableOpacity
                      style={s.deleteBtn}
                      onPress={() => deleteAnnonce(a.id)}
                    >
                      <Text style={s.deleteBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Menu */}
          {!editing && (
            <View style={s.menuCard}>
              {[
                { icon: '🤖', label: 'Assistant IA', sub: 'Conseils agricoles', route: '/ai-assistant' },
                { icon: '📦', label: 'Mes commandes', sub: 'Achats & ventes', route: '/(tabs)/orders' },
              ].map((item, i, arr) => (
                <TouchableOpacity
                  key={i}
                  style={[s.menuItem, i < arr.length - 1 && s.menuItemBorder]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={s.menuIcon}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.menuLabel}>{item.label}</Text>
                    <Text style={s.menuSub}>{item.sub}</Text>
                  </View>
                  <Text style={s.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Déconnexion */}
          {!editing && (
            <TouchableOpacity
              style={s.logoutItem}
              onPress={() => Alert.alert('Déconnexion', 'Confirmer ?', [
                { text: 'Annuler' },
                { text: 'Oui', onPress: logout },
              ])}
            >
              <View style={[s.menuIcon, { backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 18 }}>🚪</Text>
              </View>
              <Text style={s.logoutText}>Déconnexion</Text>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a3a2a' },
  editBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e8e0d0' },
  editText: { fontSize: 13, color: '#2d6a4f', fontWeight: '600' },

  profileCard: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2d6a4f', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: '#1a3a2a', marginBottom: 4 },
  role: { fontSize: 14, color: '#888', marginBottom: 2 },
  phone: { fontSize: 13, color: '#555' },

  editForm: { width: '100%', marginTop: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#e8e0d0' },
  saveBtn: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 1 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#1a3a2a', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#888' },

  section: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a3a2a' },
  seeAll: { fontSize: 13, color: '#2d6a4f', fontWeight: '700' },
  emptyAnnonces: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 12 },

  annonceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderColor: '#f0ebe0', gap: 10 },
  annonceEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  annonceTitle: { fontSize: 14, fontWeight: '700', color: '#1a3a2a' },
  annoncePrice: { fontSize: 12, color: '#888', marginTop: 2 },
  statutDot: { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },

  menuCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderColor: '#f0ebe0' },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#f5f0e8', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1a3a2a' },
  menuSub: { fontSize: 12, color: '#aaa', marginTop: 1 },
  menuArrow: { fontSize: 20, color: '#ccc' },
  logoutItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, marginBottom: 12 },
  logoutText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#dc2626' },
});
