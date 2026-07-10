import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, validateLoginForm } from '@/store/authStore';

export default function Login() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const [tel, setTel] = useState('');
  const [mdp, setMdp] = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ tel: string | null; mdp: string | null }>({ tel: null, mdp: null });
  const [touched, setTouched] = useState<{ tel: boolean; mdp: boolean }>({ tel: false, mdp: false });
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (field: 'tel' | 'mdp', value: string) => {
    const e = validateLoginForm(field === 'tel' ? value : tel, field === 'mdp' ? value : mdp);
    setErrors(prev => ({ ...prev, [field]: e[field] }));
  };

  const handleSubmit = async () => {
    setTouched({ tel: true, mdp: true });
    const e = validateLoginForm(tel, mdp);
    setErrors(e);
    if (e.tel || e.mdp) return;

    setLoading(true);
    setApiError(null);
    const result = await login(tel, mdp);
    setLoading(false);
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setApiError(result.error || 'Impossible de se connecter');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Bon retour !</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          <View style={styles.toggleWrapper}>
            <View style={styles.toggle}>
              <View style={styles.toggleActive}>
                <Text style={styles.toggleActiveText}>Connexion</Text>
              </View>
              <TouchableOpacity style={styles.toggleInactive} onPress={() => router.replace('/auth/register')}>
                <Text style={styles.toggleInactiveText}>Inscription</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.form}>

          <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
          <View style={[styles.inputRow, touched.tel && errors.tel ? styles.inputError : null]}>
            <Text style={styles.prefix}>+225</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.inputText}
              placeholder="07 00 00 00 00"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={tel}
              onChangeText={v => { setTel(v); validate('tel', v); }}
              onBlur={() => setTouched(p => ({ ...p, tel: true }))}
            />
          </View>
          {touched.tel && errors.tel && <Text style={styles.errorText}>{errors.tel}</Text>}

          <Text style={styles.label}>MOT DE PASSE</Text>
          <View style={[styles.inputRow, touched.mdp && errors.mdp ? styles.inputError : null]}>
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showMdp}
              value={mdp}
              onChangeText={v => { setMdp(v); validate('mdp', v); }}
              onBlur={() => setTouched(p => ({ ...p, mdp: true }))}
            />
            <TouchableOpacity onPress={() => setShowMdp(!showMdp)}>
              <Text style={styles.eyeIcon}>{showMdp ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {touched.mdp && errors.mdp && <Text style={styles.errorText}>{errors.mdp}</Text>}

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>ou</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity style={styles.btnWhatsapp}>
            <Text style={styles.whatsappIcon}>💬</Text>
            <Text style={styles.btnWhatsappText}>Continuer avec WhatsApp</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F0' },
  header: { backgroundColor: '#1B4332', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  backIcon: { color: '#fff', fontSize: 18, lineHeight: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#A7F3D0', marginBottom: 24 },
  toggleWrapper: { alignItems: 'flex-start' },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 28, padding: 4 },
  toggleActive: { backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 9 },
  toggleActiveText: { color: '#1B4332', fontWeight: '700', fontSize: 14 },
  toggleInactive: { paddingHorizontal: 24, paddingVertical: 9 },
  toggleInactiveText: { color: '#fff', fontSize: 14 },
  form: { backgroundColor: '#FAF7F0', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },
  inputRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  prefix: { fontSize: 15, color: '#1A1A1A', fontWeight: '600', marginRight: 10 },
  divider: { width: 1, height: 18, backgroundColor: '#E5E7EB', marginRight: 10 },
  inputText: { fontSize: 15, color: '#1A1A1A', flex: 1 },
  eyeIcon: { fontSize: 18, marginLeft: 8 },
  forgotRow: { alignItems: 'flex-end', marginTop: 10 },
  forgotText: { fontSize: 13, color: '#1B4332', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#1B4332', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 24, minHeight: 52, justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { marginHorizontal: 12, color: '#6B7280', fontSize: 13 },
  btnWhatsapp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 28, paddingVertical: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  whatsappIcon: { fontSize: 18 },
  btnWhatsappText: { color: '#1A1A1A', fontSize: 15, fontWeight: '500' },
  apiError: { color: '#EF4444', marginTop: 10, fontSize: 13, textAlign: 'center' },
});
