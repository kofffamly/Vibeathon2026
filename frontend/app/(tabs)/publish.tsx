import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const TYPES = [
  { key: 'vendre', emoji: '🏷️', label: 'Vendre un produit', sub: 'Proposez votre production à la vente' },
  { key: 'besoin', emoji: '🔍', label: 'Exprimer un besoin', sub: 'Cherchez un produit ou partenaire' },
];

const CATEGORIES = [
  { key: 'mais', emoji: '🌽', label: 'Maïs' },
  { key: 'riz', emoji: '🌾', label: 'Riz' },
  { key: 'manioc', emoji: '🥔', label: 'Manioc' },
  { key: 'tomate', emoji: '🍅', label: 'Tomate' },
  { key: 'animal', emoji: '🐄', label: 'Animal' },
  { key: 'cacao', emoji: '🍫', label: 'Cacao' },
  { key: 'banane', emoji: '🍌', label: 'Banane' },
  { key: 'autre', emoji: '📦', label: 'Autre' },
];

export default function Publish() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) return Alert.alert('Maximum 5 photos');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7,
    });
    if (!res.canceled) setImages(prev => [...prev, res.assets[0].uri]);
  };

  const submit = async () => {
    if (!title || !price || !quantity) return Alert.alert('Erreur', 'Remplis tous les champs obligatoires');
    if (!session) return Alert.alert('Erreur', 'Vous devez être connecté');
    setLoading(true);

    // Garantir que le profil existe (sécurité)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('uuid')
      .eq('uuid', session.user.id)
      .single();

    if (!existingProfile) {
      await supabase.from('profiles').insert({
        uuid: session.user.id,
        nom_complet: session.user.email?.split('@')[0] ?? 'Utilisateur',
        role: 'acheteur',
      });
    }

    const latitude: number | null = null;
    const longitude: number | null = null;

    let photo_url: string | null = null;
    if (images.length > 0) {
      const uri = images[0];
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      try {
        const blob = await (await fetch(uri)).blob();
        const { error: upErr } = await supabase.storage.from('harvests').upload(path, blob, { contentType: `image/${ext}` });
        if (!upErr) {
          const { data } = supabase.storage.from('harvests').getPublicUrl(path);
          photo_url = data.publicUrl;
        }
      } catch (_) {}
    }

    const { error } = await supabase.from('recoltes').insert({
      agriculteur_id: session.user.id,
      type_produit: category ?? title,
      quantite_kg: parseFloat(quantity) || 0,
      prix_fcfa_kg: parseFloat(price) || 0,
      statut: 'disponible',
      photo_url,
      latitude,
      longitude,
    });

    setLoading(false);
    if (error) { Alert.alert('Erreur', error.message); return; }
    Alert.alert('✅ Publié !', 'Votre annonce est en ligne.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  // ── Étape 1 ──
  if (step === 1) return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.topBarTitle}>Publier une annonce</Text>
          <Text style={s.topBarStep}>Étape 1 sur 3</Text>
        </View>
      </View>
      <View style={s.progressBar}><View style={[s.progressFill, { width: '33%' }]} /></View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>Que souhaitez-vous faire ?</Text>
        <Text style={s.subheading}>Choisissez le type d'annonce à publier.</Text>
        {TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[s.typeCard, type === t.key && s.typeCardActive]} onPress={() => setType(t.key)}>
            <View style={[s.typeIcon, type === t.key && s.typeIconActive]}>
              <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.typeLabel, type === t.key && s.typeLabelActive]}>{t.label}</Text>
              <Text style={s.typeSub}>{t.sub}</Text>
            </View>
            {type === t.key && <View style={s.checkCircle}><Text style={{ color: '#fff', fontSize: 12 }}>✓</Text></View>}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={[s.nextBtn, !type && s.nextBtnDisabled]} onPress={() => type && setStep(2)} disabled={!type}>
          <Text style={s.nextBtnText}>Continuer →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Étape 2 ──
  if (step === 2) return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => setStep(1)} style={s.closeBtn}>
          <Text style={s.closeBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.topBarTitle}>Publier une annonce</Text>
          <Text style={s.topBarStep}>Étape 2 sur 3</Text>
        </View>
      </View>
      <View style={s.progressBar}><View style={[s.progressFill, { width: '66%' }]} /></View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>Quel produit ?</Text>
        <Text style={s.subheading}>Sélectionner une catégorie.</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.key} style={[s.catCard, category === c.key && s.catCardActive]} onPress={() => setCategory(c.key)}>
              <Text style={{ fontSize: 32, marginBottom: 6 }}>{c.emoji}</Text>
              <Text style={[s.catLabel, category === c.key && s.catLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={[s.nextBtn, !category && s.nextBtnDisabled]} onPress={() => category && setStep(3)} disabled={!category}>
          <Text style={s.nextBtnText}>Continuer →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Étape 3 ──
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => setStep(2)} style={s.closeBtn}>
            <Text style={s.closeBtnText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.topBarTitle}>Publier une annonce</Text>
            <Text style={s.topBarStep}>Étape 3 sur 3</Text>
          </View>
        </View>
        <View style={s.progressBar}><View style={[s.progressFill, { width: '100%' }]} /></View>

        <ScrollView
          contentContainerStyle={[s.body, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.heading}>Détails de l'annonce</Text>
          <Text style={s.subheading}>Complétez les informations de votre annonce.</Text>

          <TouchableOpacity style={s.photoBox} onPress={pickImage}>
            {images.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((uri, i) => <Image key={i} source={{ uri }} style={s.photoThumb} />)}
              </ScrollView>
            ) : (
              <>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>🖼️</Text>
                <Text style={s.photoLabel}>Ajouter des photos</Text>
                <Text style={s.photoSub}>jusqu'à 5 photos (recommandé)</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={s.fieldLabel}>TITRE DE L'ANNONCE *</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Maïs local – récolte 2024"
            placeholderTextColor="#bbb"
            returnKeyType="next"
          />

          <Text style={s.fieldLabel}>DESCRIPTION</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Qualité, condition, informations utiles..."
            placeholderTextColor="#bbb"
            multiline
            textAlignVertical="top"
          />

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>QUANTITÉ (kg) *</Text>
              <TextInput
                style={s.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Ex: 50"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                returnKeyType="next"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>PRIX (FCFA/kg) *</Text>
              <TextInput
                style={s.input}
                value={price}
                onChangeText={setPrice}
                placeholder="FCFA"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                returnKeyType="next"
              />
            </View>
          </View>

          <Text style={s.fieldLabel}>LOCALISATION</Text>
          <TextInput
            style={s.input}
            value={location}
            onChangeText={setLocation}
            placeholder="📍 Ville/Village"
            placeholderTextColor="#bbb"
            returnKeyType="done"
          />
        </ScrollView>

        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={s.publishBtn} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.publishBtnText}>✨  Publier l'annonce</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8e0d0' },
  closeBtnText: { fontSize: 16, color: '#1a3a2a', fontWeight: '700' },
  topBarTitle: { fontSize: 15, fontWeight: '700', color: '#1a3a2a' },
  topBarStep: { fontSize: 12, color: '#888', marginTop: 1 },
  progressBar: { height: 4, backgroundColor: '#e8e0d0', marginHorizontal: 16, borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: '#2d5a3d', borderRadius: 2 },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  heading: { fontSize: 22, fontWeight: '800', color: '#1a3a2a', marginBottom: 6 },
  subheading: { fontSize: 14, color: '#888', marginBottom: 24 },
  typeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#e8e0d0', gap: 14 },
  typeCardActive: { borderColor: '#2d5a3d', backgroundColor: '#f0fdf4' },
  typeIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f5f0e8', alignItems: 'center', justifyContent: 'center' },
  typeIconActive: { backgroundColor: '#dcfce7' },
  typeLabel: { fontSize: 15, fontWeight: '700', color: '#1a3a2a', marginBottom: 2 },
  typeLabelActive: { color: '#2d5a3d' },
  typeSub: { fontSize: 12, color: '#888' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2d5a3d', alignItems: 'center', justifyContent: 'center' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1.5, borderColor: '#e8e0d0' },
  catCardActive: { borderColor: '#2d5a3d', backgroundColor: '#f0fdf4' },
  catLabel: { fontSize: 14, fontWeight: '700', color: '#1a3a2a' },
  catLabelActive: { color: '#2d5a3d' },
  photoBox: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#e8e0d0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', minHeight: 100, marginBottom: 16, padding: 16, overflow: 'hidden' },
  photoLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 2 },
  photoSub: { fontSize: 12, color: '#aaa' },
  photoThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#e8e0d0', marginBottom: 4 },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  bottomBar: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#f5f0e8', borderTopWidth: 1, borderColor: '#e8e0d0' },
  nextBtn: { backgroundColor: '#2d5a3d', padding: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#a3c4a8' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  publishBtn: { backgroundColor: '#2d5a3d', padding: 16, borderRadius: 14, alignItems: 'center' },
  publishBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
