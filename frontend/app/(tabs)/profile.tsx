import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';

type MenuItem = {
  icon:    string;
  label:   string;
  sub:     string;
  route?:  string;
  danger?: boolean;
};

const MENU: MenuItem[] = [
  { icon: '📝', label: 'Mes annonces',   sub: '2 actives' },
  { icon: '📦', label: 'Mes commandes',  sub: 'Achats & ventes',      route: '/(tabs)/orders' },
  { icon: '⭐', label: 'Mes avis',        sub: '4.8 · 23 avis' },
  { icon: '🤖', label: 'Assistant IA',   sub: 'Conseils agricoles',   route: '/ai-assistant' },
  { icon: '🔔', label: 'Notifications',  sub: '3 non lues' },
  { icon: '📍', label: 'Localisation',   sub: "Bouaké, Côte d'Ivoire" },
  { icon: '🔒', label: 'Sécurité',       sub: 'Mot de passe, 2FA' },
  { icon: '❓', label: 'Aide & Support', sub: 'FAQ, contact' },
  { icon: '🚪', label: 'Déconnexion',    sub: '', route: '/auth/login', danger: true },
];

const MY_LISTINGS = [
  {
    id: '1', title: 'Maïs local – récolte 2024', price: '1 200 FCFA/sac', views: 42,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=120&h=90&fit=crop&auto=format',
  },
];

export default function ProfileScreen() {
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const logout  = useAuthStore(s => s.logout);
  const [editMode, setEditMode] = useState(false);

  const displayName = user?.nom ?? 'Amadou Koné';
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel   = user?.role?.join(' · ') ?? 'Agriculteur · Éleveur';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>

      {/* ── Header ── */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Mon profil</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(v => !v)}>
              <Text style={styles.editBtnTxt}>{editMode ? '✓ Sauvegarder' : '✏️ Modifier'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>{roleLabel}</Text>
              <View style={styles.locRow}>
                <Feather name="map-pin" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locTxt}>Bouaké, Côte d'Ivoire</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Stats card ── */}
      <View style={styles.statsCard}>
        {[
          { value: '12',    label: 'Annonces', icon: '📢' },
          { value: '48',    label: 'Ventes',   icon: '💰' },
          { value: '4.8★',  label: 'Note',     icon: '⭐' },
          { value: '2 ans', label: 'Membre',   icon: '🏅' },
        ].map((s, i) => (
          <View key={s.label} style={[styles.statItem, i < 3 && styles.statBorder]}>
            <Text style={{ fontSize: 10, marginBottom: 3 }}>{s.icon}</Text>
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>

        {/* ── My listings ── */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes annonces</Text>
            <Text style={styles.seeAll}>Voir tout →</Text>
          </View>
          {MY_LISTINGS.map(l => (
            <View key={l.id} style={styles.listingRow}>
              <Image source={{ uri: l.image }} style={styles.listingImg} />
              <View style={styles.listingBody}>
                <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                <Text style={styles.listingPrice}>{l.price}</Text>
                <Text style={styles.listingViews}>👁 {l.views} vues</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeTxt}>Actif</Text>
                </View>
                <TouchableOpacity style={styles.manageBtn}>
                  <Text style={styles.manageBtnTxt}>Gérer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ── Menu ── */}
        <View style={styles.menu}>
          {MENU.map((item, i) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  if (item.danger) { logout(); router.replace('/auth/login'); }
                  else if (item.route) router.push(item.route as any);
                }}
              >
                <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, item.danger && { color: Colors.error }]}>
                    {item.label}
                  </Text>
                  {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
                </View>
                {!item.danger && (
                  <Feather name="chevron-right" size={16} color={Colors.mutedFg} />
                )}
              </TouchableOpacity>
              {i < MENU.length - 1 && <View style={styles.menuDivider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingBottom: 28 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10,
  },
  editBtnTxt:     { color: Colors.white, fontSize: 12, fontWeight: '700' },
  avatarRow:      { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarTxt:      { fontSize: 28, fontWeight: '800', color: Colors.white },
  name:           { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  role:           { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 2 },
  locRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  locTxt:         { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  statsCard: {
    margin: 20, marginTop: -20, backgroundColor: Colors.white, borderRadius: 16,
    flexDirection: 'row', padding: 16,
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
  },
  statItem:       { flex: 1, alignItems: 'center' },
  statBorder:     { borderRightWidth: 1, borderRightColor: Colors.border },
  statVal:        { fontSize: 17, fontWeight: '800', color: Colors.primary },
  statLabel:      { fontSize: 10, fontWeight: '600', color: Colors.mutedFg, marginTop: 2 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle:   { fontSize: 15, fontWeight: '800', color: Colors.fg },
  seeAll:         { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  listingRow: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  listingImg:     { width: 72, height: 68 },
  listingBody:    { flex: 1, padding: 10 },
  listingTitle:   { fontSize: 13, fontWeight: '700', color: Colors.fg, marginBottom: 2 },
  listingPrice:   { fontSize: 12, fontWeight: '700', color: Colors.primary },
  listingViews:   { fontSize: 11, color: Colors.mutedFg, fontWeight: '500', marginTop: 2 },
  activeBadge:    { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, margin: 10, marginBottom: 4 },
  activeBadgeTxt: { color: '#166534', fontSize: 10, fontWeight: '800' },
  manageBtn:      { marginHorizontal: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg },
  manageBtnTxt:   { fontSize: 11, fontWeight: '700', color: Colors.mutedFg },
  menu: {
    backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.fg, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  menuItem:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  menuIcon:       { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  menuIconDanger: { backgroundColor: '#FEE2E2' },
  menuLabel:      { fontSize: 14, fontWeight: '700', color: Colors.fg },
  menuSub:        { fontSize: 11, color: Colors.mutedFg, fontWeight: '500', marginTop: 1 },
  menuDivider:    { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
});
