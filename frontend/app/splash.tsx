import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Splash() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <LinearGradient colors={['#1a3a2a', '#2d5a3d', '#1a3a2a']} style={StyleSheet.absoluteFill} />

      <View style={s.top}>
        <View style={s.logoBox}>
          <Text style={{ fontSize: 28 }}>🌿</Text>
        </View>
        <Text style={s.brand}>AgroMarket</Text>
        <Text style={s.tagline}>La marketplace des agriculteurs</Text>

        <View style={s.chips}>
          {['🌾 Récoltes', '🐄 Élevage', '🧪 Intrants'].map(c => (
            <View key={c} style={s.chip}>
              <Text style={s.chipText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.banner}>
        <View style={s.bannerOverlay}>
          <Text style={s.bannerSub}>Disponible en</Text>
          <Text style={s.bannerTitle}>Côte d'Ivoire & région</Text>
        </View>
      </View>

      <View style={s.bottom}>
        <TouchableOpacity style={s.btnWhite} onPress={() => router.push('/auth/login')}>
          <Text style={s.btnWhiteText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline} onPress={() => router.push({ pathname: '/auth/login', params: { tab: 'signup' } })}>
          <Text style={s.btnOutlineText}>Créer un compte</Text>
        </TouchableOpacity>
        <Text style={s.legal}>En continuant, vous acceptez nos Conditions d'utilisation</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a3a2a' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brand: { fontSize: 34, fontWeight: '800', color: '#f5e6c8', letterSpacing: 0.5, marginBottom: 6 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  banner: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', height: 140, backgroundColor: '#2d5a3d', marginBottom: 32, justifyContent: 'flex-end' },
  bannerOverlay: { padding: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottom: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  btnWhite: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnWhiteText: { color: '#1a3a2a', fontWeight: '700', fontSize: 16 },
  btnOutline: { backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  btnOutlineText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  legal: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 },
});
