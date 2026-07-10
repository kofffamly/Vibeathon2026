import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const ROLES = ['Agriculteur', 'Éleveur', 'Fournisseur d\'intrants', 'Acheteur / Commerçant', 'Agronome', 'Autre'];

const phoneToEmail = (phone: string) => `${phone.replace(/\s/g, '')}@agrilink.app`;

export default function Login() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'login' | 'signup'>(tab === 'signup' ? 'signup' : 'login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('Agriculteur');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const submit = async () => {
    if (!phone.trim()) return Alert.alert('Erreur', 'Numéro de téléphone requis');
    if (!password) return Alert.alert('Erreur', 'Mot de passe requis');
    if (mode === 'signup' && !name.trim()) return Alert.alert('Erreur', 'Nom complet requis');
    setLoading(true);
    const email = phoneToEmail(phone);
    const err = mode === 'login'
      ? await login(email, password)
      : await register(email, password, name, phone, location, role);
    setLoading(false);
    if (err) Alert.alert('Erreur', err);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[s.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>{mode === 'login' ? 'Bon retour !' : 'Rejoignez-nous'}</Text>
          <Text style={s.subtitle}>{mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuit'}</Text>
        </View>

        <View style={s.body}>
          <View style={s.tabs}>
            <TouchableOpacity style={[s.tabBtn, mode === 'login' && s.tabActive]} onPress={() => setMode('login')}>
              <Text style={[s.tabText, mode === 'login' && s.tabTextActive]}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tabBtn, mode === 'signup' && s.tabActive]} onPress={() => setMode('signup')}>
              <Text style={[s.tabText, mode === 'signup' && s.tabTextActive]}>Inscription</Text>
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <>
              <Text style={s.label}>NOM COMPLET</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Ex: Amadou Koné" placeholderTextColor="#bbb" />

              <Text style={s.label}>NUMÉRO DE TÉLÉPHONE</Text>
              <View style={s.phoneRow}>
                <View style={s.flag}><Text style={s.flagText}>+225</Text></View>
                <TextInput style={[s.input, s.phoneInput]} value={phone} onChangeText={setPhone} placeholder="07 00 00 00 00" keyboardType="phone-pad" placeholderTextColor="#bbb" />
              </View>

              <Text style={s.label}>LOCALISATION</Text>
              <View style={s.inputRow}>
                <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={location} onChangeText={setLocation} placeholder="Ville / Région" placeholderTextColor="#bbb" />
                <Text style={s.pin}>📍</Text>
              </View>

              <Text style={s.label}>TYPE D'ACTIVITÉ</Text>
              <View style={s.rolesWrap}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r} style={[s.roleChip, role === r && s.roleChipActive]} onPress={() => setRole(r)}>
                    <Text style={[s.roleText, role === r && s.roleTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {mode === 'login' && (
            <>
              <Text style={s.label}>NUMÉRO DE TÉLÉPHONE</Text>
              <View style={s.phoneRow}>
                <View style={s.flag}><Text style={s.flagText}>+225</Text></View>
                <TextInput style={[s.input, s.phoneInput]} value={phone} onChangeText={setPhone} placeholder="07 00 00 00 00" keyboardType="phone-pad" placeholderTextColor="#bbb" />
              </View>
            </>
          )}

          <Text style={s.label}>MOT DE PASSE</Text>
          <View style={s.inputRow}>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholder="••••••••" placeholderTextColor="#bbb" />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {mode === 'login' && (
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
              <Text style={s.forgot}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</Text>
          </TouchableOpacity>

          {mode === 'login' && (
            <>
              <Text style={s.or}>ou</Text>
              <TouchableOpacity style={s.whatsappBtn}>
                <Text style={s.whatsappText}>💬  Continuer avec WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  header: { backgroundColor: '#1a3a2a', paddingBottom: 32, paddingHorizontal: 24 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  backText: { color: '#fff', fontSize: 18 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  body: { flex: 1, padding: 24 },
  tabs: { flexDirection: 'row', backgroundColor: '#e8e0d0', borderRadius: 10, marginBottom: 24, padding: 4 },
  tabBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#1a3a2a', fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, color: '#111', marginBottom: 4, borderWidth: 1, borderColor: '#e8e0d0' },
  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  flag: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#e8e0d0' },
  flagText: { fontSize: 14, fontWeight: '700', color: '#1a3a2a' },
  phoneInput: { flex: 1, marginBottom: 0 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pin: { fontSize: 20 },
  eyeBtn: { padding: 8 },
  rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e8e0d0', borderWidth: 1, borderColor: '#ddd' },
  roleChipActive: { backgroundColor: '#2d5a3d', borderColor: '#2d5a3d' },
  roleText: { fontSize: 13, color: '#555' },
  roleTextActive: { color: '#fff', fontWeight: '600' },
  forgot: { color: '#2d5a3d', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  btn: { backgroundColor: '#2d5a3d', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  or: { textAlign: 'center', color: '#aaa', marginVertical: 16, fontSize: 13 },
  whatsappBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e8e0d0' },
  whatsappText: { color: '#25D366', fontWeight: '700', fontSize: 15 },
});
