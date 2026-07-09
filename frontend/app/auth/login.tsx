import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const ACTIVITIES = [
  'Agriculteur', 'Éleveur', "Fournisseur d'intrants",
  'Acheteur / Commerçant', 'Agronome', 'Autre',
];

export default function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [activity, setActivity] = useState('Agriculteur');
  const [showPwd, setShowPwd] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>

        {/* ── Header ── */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={18} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.heading}>
              {tab === 'login' ? 'Bon retour !' : 'Rejoignez-nous'}
            </Text>
            <Text style={styles.subheading}>
              {tab === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuit'}
            </Text>

            {/* Tab switcher */}
            <View style={styles.tabs}>
              {(['login', 'signup'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                  onPress={() => setTab(t)}
                >
                  <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>
                    {t === 'login' ? 'Connexion' : 'Inscription'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Form ── */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {tab === 'signup' && (
            <Field label="Nom complet" placeholder="Ex: Amadou Koné" />
          )}

          <View style={styles.field}>
            <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixTxt}>+225</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="07 00 00 00 00"
                keyboardType="phone-pad"
                placeholderTextColor={Colors.mutedFg}
              />
            </View>
          </View>

          {tab === 'signup' && (
            <>
              <Field label="Localisation" placeholder="Ville / Région" icon="map-pin" />
              <View style={styles.field}>
                <Text style={styles.label}>TYPE D'ACTIVITÉ</Text>
                <View style={styles.activityGrid}>
                  {ACTIVITIES.map(a => (
                    <TouchableOpacity
                      key={a}
                      style={[styles.chip, activity === a && styles.chipActive]}
                      onPress={() => setActivity(a)}
                    >
                      <Text style={[styles.chipTxt, activity === a && styles.chipTxtActive]}>
                        {a}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>MOT DE PASSE</Text>
            <View style={styles.pwdRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                secureTextEntry={!showPwd}
                placeholderTextColor={Colors.mutedFg}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(v => !v)}>
                <Feather name={showPwd ? 'eye-off' : 'eye'} size={18} color={Colors.mutedFg} />
              </TouchableOpacity>
            </View>
          </View>

          {tab === 'login' && (
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 4 }}>
              <Text style={styles.forgot}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.ctaGrad}>
              <Text style={styles.ctaTxt}>
                {tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerTxt}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.whatsappBtn}>
            <Text style={{ fontSize: 20 }}>💬</Text>
            <Text style={styles.whatsappTxt}>Continuer avec WhatsApp</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, placeholder, icon }: { label: string; placeholder: string; icon?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedFg}
        />
        {icon && (
          <View style={styles.inputIcon}>
            <Feather name={icon as any} size={16} color={Colors.mutedFg} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:     { paddingHorizontal: 24, paddingBottom: 24 },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    padding: 8, alignSelf: 'flex-start', marginBottom: 16,
  },
  heading:    { fontSize: 28, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  subheading: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginBottom: 20 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, padding: 4,
  },
  tabBtn:       { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.white },
  tabTxt:       { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  tabTxtActive: { color: Colors.primary },
  form:         { padding: 24, gap: 16, paddingBottom: 48 },
  field:        { gap: 6 },
  label:        { fontSize: 12, fontWeight: '700', color: Colors.mutedFg, letterSpacing: 0.7 },
  input: {
    backgroundColor: Colors.white, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 14, color: Colors.fg, fontWeight: '500',
  },
  phoneRow:     { flexDirection: 'row', gap: 8 },
  prefix: {
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center',
  },
  prefixTxt:    { fontSize: 13, fontWeight: '700', color: Colors.mutedFg },
  phoneInput:   { flex: 1 },
  pwdRow:       { flexDirection: 'row', alignItems: 'center' },
  eyeBtn:       { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  inputIcon:    { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive:    { borderColor: Colors.primary, backgroundColor: `${Colors.primary}18` },
  chipTxt:       { fontSize: 12, fontWeight: '600', color: Colors.mutedFg },
  chipTxtActive: { color: Colors.primary, fontWeight: '700' },
  forgot:        { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  cta:           { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  ctaGrad:       { paddingVertical: 17, alignItems: 'center' },
  ctaTxt:        { color: Colors.white, fontSize: 16, fontWeight: '800' },
  divider:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine:   { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerTxt:    { fontSize: 12, color: Colors.mutedFg, fontWeight: '600' },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, paddingVertical: 15,
  },
  whatsappTxt: { fontSize: 14, fontWeight: '700', color: Colors.fg },
});
