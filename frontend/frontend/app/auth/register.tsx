import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, validateRegisterForm } from '@/store/authStore';

const ACTIVITES = [
  'Agriculteur', 'Éleveur', "Fournisseur d'intrants",
  'Acheteur / Commerçant', 'Agronome', 'Autre',
];

type Fields = 'nom' | 'tel' | 'localisation' | 'activites' | 'mdp';

export default function Register() {
  const router = useRouter();
  const register = useAuthStore(s => s.register);

  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [mdp, setMdp] = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [activites, setActivites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<Fields, boolean>>({ nom: false, tel: false, localisation: false, activites: false, mdp: false });
  const [errors, setErrors] = useState<Record<Fields, string | null>>({ nom: null, tel: null, localisation: null, activites: null, mdp: null });

  const touch = (field: Fields) => setTouched(p => ({ ...p, [field]: true }));

  const revalidate = (overrides?: Partial<{ nom: string; tel: string; localisation: string; activites: string[]; mdp: string }>) => {
    const e = validateRegisterForm(
      overrides?.nom ?? nom,
      overrides?.tel ?? tel,
      overrides?.localisation ?? localisation,
      overrides?.activites ?? activites,
      overrides?.mdp ?? mdp,
    );
    setErrors(e);
    return e;
  };

  const toggleActivite = (a: string) => {
    const next = activites.includes(a) ? activites.filter(x => x !== a) : [...activites, a];
    setActivites(next);
    touch('activites');
    revalidate({ activites: next });
  };

  const handleSubmit = async () => {
    setTouched({ nom: true, tel: true, localisation: true, activites: true, mdp: true });
    const e = revalidate();
    if (Object.values(e).some(v => v !== null)) return;

    setLoading(true);
    const result = await register({ nom, tel, localisation, activites, mdp });
    setLoading(false);
    if (result.success) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Rejoignez-nous</Text>
          <Text style={styles.subtitle}>Créez votre compte gratuit</Text>
          <View style={styles.toggleWrapper}>
            <View style={styles.toggle}>
              <TouchableOpacity style={styles.toggleInactive} onPress={() => router.replace('/auth/login')}>
                <Text style={styles.toggleInactiveText}>Connexion</Text>
              </TouchableOpacity>
              <View style={styles.toggleActive}>
                <Text style={styles.toggleActiveText}>Inscription</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.form}>

          <Text style={styles.label}>NOM COMPLET</Text>
          <TextInput
            style={[styles.input, touched.nom && errors.nom ? styles.inputError : null]}
            placeholder="Ex: Amadou Koné"
            placeholderTextColor="#9CA3AF"
            value={nom}
            onChangeText={v => { setNom(v); revalidate({ nom: v }); }}
            onBlur={() => touch('nom')}
          />
          {touched.nom && errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}

          <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
          <View style={[styles.inputRow, touched.tel && errors.tel ? styles.inputError : null]}>
            <Text style={styles.prefix}>+225</Text>
            <View style={styles.divider} />
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="07 00 00 00 00"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={tel}
              onChangeText={v => { setTel(v); revalidate({ tel: v }); }}
              onBlur={() => touch('tel')}
            />
          </View>
          {touched.tel && errors.tel && <Text style={styles.errorText}>{errors.tel}</Text>}

          <Text style={styles.label}>LOCALISATION</Text>
          <View style={[styles.inputRow, touched.localisation && errors.localisation ? styles.inputError : null]}>
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="Ville / Région"
              placeholderTextColor="#9CA3AF"
              value={localisation}
              onChangeText={v => { setLocalisation(v); revalidate({ localisation: v }); }}
              onBlur={() => touch('localisation')}
            />
            <Text style={styles.pinIcon}>📍</Text>
          </View>
          {touched.localisation && errors.localisation && <Text style={styles.errorText}>{errors.localisation}</Text>}

          <Text style={styles.label}>TYPE D'ACTIVITÉ</Text>
          <View style={styles.chips}>
            {ACTIVITES.map(a => {
              const selected = activites.includes(a);
              return (
                <TouchableOpacity key={a} style={[styles.chip, selected && styles.chipSelected]} onPress={() => toggleActivite(a)}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {touched.activites && errors.activites && <Text style={styles.errorText}>{errors.activites}</Text>}

          <Text style={styles.label}>MOT DE PASSE</Text>
          <View style={[styles.inputRow, touched.mdp && errors.mdp ? styles.inputError : null]}>
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showMdp}
              value={mdp}
              onChangeText={v => { setMdp(v); revalidate({ mdp: v }); }}
              onBlur={() => touch('mdp')}
            />
            <TouchableOpacity onPress={() => setShowMdp(!showMdp)}>
              <Text style={styles.eyeIcon}>{showMdp ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {touched.mdp && errors.mdp && <Text style={styles.errorText}>{errors.mdp}</Text>}

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
            }
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
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#1A1A1A', borderWidth: 1, borderColor: '#E5E7EB' },
  inputRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  prefix: { fontSize: 15, color: '#1A1A1A', fontWeight: '600', marginRight: 10 },
  divider: { width: 1, height: 18, backgroundColor: '#E5E7EB', marginRight: 10 },
  inputText: { fontSize: 15, color: '#1A1A1A' },
  pinIcon: { fontSize: 16, marginLeft: 8 },
  eyeIcon: { fontSize: 18, marginLeft: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  chipSelected: { backgroundColor: '#ECFDF5', borderColor: '#1B4332' },
  chipText: { fontSize: 13, color: '#6B7280' },
  chipTextSelected: { color: '#1B4332', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#1B4332', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 28, marginBottom: 32, minHeight: 52, justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
