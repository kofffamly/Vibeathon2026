import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ImageBackground, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'

const { width } = Dimensions.get('window')

export default function SplashScreen() {
  const router = useRouter()

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primary, '#2E7D50']}
      style={styles.container}
      start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <SafeAreaView style={styles.safe}>
        {/* ── Content ── */}
        <View style={styles.content}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 48 }}>🌿</Text>
          </View>

          <Text style={styles.brand}>
            Agro<Text style={{ color: Colors.accentLight }}>Market</Text>
          </Text>
          <Text style={styles.tagline}>La marketplace des agriculteurs</Text>

          <View style={styles.pills}>
            {['🌾 Récoltes', '🐄 Élevage', '🌱 Intrants'].map(t => (
              <View key={t} style={styles.pill}>
                <Text style={styles.pillText}>{t}</Text>
              </View>
            ))}
          </View>

          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=300&fit=crop&auto=format' }}
            style={styles.hero}
            imageStyle={{ borderRadius: 20 }}
          >
            <LinearGradient
              colors={['rgba(18,64,37,0.55)', 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            />
            <View style={styles.heroCaption}>
              <Text style={styles.heroSub}>Disponible en</Text>
              <Text style={styles.heroMain}>Côte d'Ivoire & région</Text>
            </View>
          </ImageBackground>
        </View>

        {/* ── CTAs ── */}
        <View style={styles.ctas}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryTxt}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryTxt}>Créer un compte</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            En continuant, vous acceptez nos Conditions d'utilisation
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe:      { flex: 1 },
  circle1: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  circle2: {
    position: 'absolute', bottom: -60, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  content: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 24,
  },
  logoBox: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  brand: {
    fontSize: 40, color: Colors.white,
    letterSpacing: -0.5, marginBottom: 8, fontWeight: '700',
  },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    fontWeight: '500', marginBottom: 16,
  },
  pills: {
    flexDirection: 'row', gap: 8, marginBottom: 36,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
  },
  pillText:    { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  hero:        { width: width - 48, height: 140, borderRadius: 20, overflow: 'hidden' },
  heroCaption: { position: 'absolute', bottom: 14, left: 16 },
  heroSub:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  heroMain:    { fontSize: 14, color: Colors.white, fontWeight: '700' },
  ctas:        { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  btnPrimary: {
    backgroundColor: Colors.white, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 12, elevation: 6,
  },
  btnPrimaryTxt:   { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  btnSecondary: {
    borderRadius: 16, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 17, alignItems: 'center',
  },
  btnSecondaryTxt: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  disclaimer: {
    textAlign: 'center', fontSize: 11,
    color: 'rgba(255,255,255,0.45)', fontWeight: '500', marginTop: 4,
  },
})
