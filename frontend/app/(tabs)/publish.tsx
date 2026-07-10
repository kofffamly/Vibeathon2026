import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListingStore } from '@/store/listingStore';

const TYPES = [
  { key: 'vente',  label: 'Vendre un produit', desc: 'Proposez votre production à la vente',   emoji: '🏷️' },
  { key: 'besoin', label: 'Exprimer un besoin', desc: 'Cherchez un produit ou partenaire',       emoji: '🔍' },
];

const CATEGORIES = [
  { key: 'récoltes', label: 'Récolte', emoji: '🌾' },
  { key: 'animaux',  label: 'Animal',  emoji: '🐄' },
  { key: 'intrants', label: 'Intrant', emoji: '🌱' },
  { key: 'résidus',  label: 'Résidu',  emoji: '♻️' },
];

export default function PublishScreen() {
  const router     = useRouter();
  const addListing = useListingStore(s => s.addListing);

  const [step,     setStep]     = useState(1);
  const [type,     setType]     = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [titre,    setTitre]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [quantite, setQuantite] = useState('');
  const [prix,     setPrix]     = useState('');
  const [lieu,     setLieu]     = useState('');

  const canContinue = (step === 1 && !!type) || (step === 2 && !!category);

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else router.back();
  };

  const handlePublish = () => {
    if (!titre.trim() || !prix.trim()) return;
    addListing({
      id:           Date.now().toString(),
      title:        titre,
      price:        prix,
      unit:         quantite ? `/${quantite}` : '/unité',
      image:        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format',
      location:     lieu || "Côte d'Ivoire",
      category:     (category as any) ?? 'récoltes',
      sellerRating: 5.0,
    });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.root} edges={['top']}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
            <Feather name={step > 1 ? 'arrow-left' : 'x'} size={18} color={Colors.fg} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Publier une annonce</Text>
            <Text style={styles.headerSub}>Étape {step} sur 3</Text>
          </View>
        </View>

        {/* ── Barre de progression ── */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={[styles.progressBar, s <= step && styles.progressBarActive]} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Étape 1 : Type ── */}
          {step === 1 && (
            <View style={{ gap: 12 }}>
              <Text style={styles.stepTitle}>Que souhaitez-vous faire ?</Text>
              <Text style={styles.stepSub}>Choisissez le type d'annonce à publier.</Text>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeCard, type === t.key && styles.typeCardActive]}
                  onPress={() => setType(t.key)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.typeIconBox, type === t.key && styles.typeIconBoxActive]}>
                    <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typeLabel, type === t.key && { color: Colors.primary }]}>{t.label}</Text>
                    <Text style={styles.typeDesc}>{t.desc}</Text>
                  </View>
                  {type === t.key && (
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={13} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Étape 2 : Catégorie ── */}
          {step === 2 && (
            <View style={{ gap: 12 }}>
              <Text style={styles.stepTitle}>Quel produit ?</Text>
              <Text style={styles.stepSub}>Sélectionnez une catégorie.</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.catCard, category === cat.key && styles.catCardActive]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, category === cat.key && { color: Colors.primary }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Étape 3 : Formulaire ── */}
          {step === 3 && (
            <View style={{ gap: 16 }}>
              <Text style={styles.stepTitle}>Détails de l'annonce</Text>
              <Text style={styles.stepSub}>Complétez les informations de votre annonce.</Text>

              {/* Photo */}
              <TouchableOpacity style={styles.photoBox}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>🖼️</Text>
                <Text style={styles.photoTxt}>Ajouter des photos</Text>
                <Text style={styles.photoSub}>Jusqu'à 5 photos (recommandé)</Text>
              </TouchableOpacity>

              <Field label="TITRE DE L'ANNONCE" placeholder="Ex: Maïs local – récolte 2024"
                value={titre} onChangeText={setTitre} />

              <Field label="DESCRIPTION"
                placeholder="Décrivez votre produit : qualité, condition, informations utiles..."
                multiline value={desc} onChangeText={setDesc} />

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Field label="QUANTITÉ" placeholder="Ex: 50 sacs"
                    value={quantite} onChangeText={setQuantite} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="PRIX" placeholder="FCFA"
                    keyboardType="numeric" value={prix} onChangeText={setPrix} />
                </View>
              </View>

              <Field label="LOCALISATION" placeholder="Ville / Village"
                icon="map-pin" value={lieu} onChangeText={setLieu} />
            </View>
          )}
        </ScrollView>

        {/* ── Bouton bas ── */}
        <View style={styles.bottomBar}>
          {step < 3 ? (
            <TouchableOpacity
              style={[styles.actionBtn, !canContinue && styles.actionBtnDisabled]}
              onPress={() => canContinue && setStep(s => s + 1)}
              activeOpacity={canContinue ? 0.85 : 1}
              disabled={!canContinue}
            >
              <Text style={[styles.actionBtnTxt, !canContinue && { color: Colors.mutedFg }]}>
                Continuer →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, (!titre.trim() || !prix.trim()) && styles.actionBtnDisabled]}
              onPress={handlePublish}
              activeOpacity={0.85}
              disabled={!titre.trim() || !prix.trim()}
            >
              <Text style={styles.actionBtnTxt}>✨ Publier l'annonce</Text>
            </TouchableOpacity>
          )}
        </View>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label:         string;
  placeholder:   string;
  multiline?:    boolean;
  icon?:         string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  value:         string;
  onChangeText:  (t: string) => void;
}

function Field({ label, placeholder, multiline, icon, keyboardType, value, onChangeText }: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View>
        <TextInput
          style={[styles.fieldInput, multiline && { minHeight: 88, textAlignVertical: 'top', paddingTop: 12 }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedFg}
          multiline={multiline}
          keyboardType={keyboardType ?? 'default'}
          value={value}
          onChangeText={onChangeText}
        />
        {icon && (
          <View style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}>
            <Feather name={icon as any} size={15} color="#EF4444" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerBtn:   { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.fg },
  headerSub:   { fontSize: 12, color: Colors.mutedFg, marginTop: 1 },

  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.muted },
  progressBarActive: { backgroundColor: Colors.primary },

  content: { padding: 24, paddingBottom: 32 },

  stepTitle: { fontSize: 22, fontWeight: '700', color: Colors.fg, marginBottom: 4 },
  stepSub:   { fontSize: 13, color: Colors.mutedFg, marginBottom: 4 },

  // Type cards
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  typeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  typeIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  typeIconBoxActive: { backgroundColor: `${Colors.primary}18` },
  typeLabel:   { fontSize: 14, fontWeight: '700', color: Colors.fg },
  typeDesc:    { fontSize: 12, color: Colors.mutedFg, marginTop: 2 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // Category grid
  catGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: {
    width: '47%', paddingVertical: 24,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white, alignItems: 'center', gap: 8,
  },
  catCardActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08` },
  catEmoji:      { fontSize: 36 },
  catLabel:      { fontSize: 13, fontWeight: '700', color: Colors.fg },

  // Photo box
  photoBox: {
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    borderStyle: 'dashed', backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 24,
  },
  photoTxt: { fontSize: 13, fontWeight: '700', color: Colors.fg },
  photoSub: { fontSize: 11, color: Colors.mutedFg, marginTop: 2 },

  // Form fields
  twoCol:     { flexDirection: 'row', gap: 10 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.mutedFg, letterSpacing: 0.6 },
  fieldInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.fg,
  },

  // Bottom bar
  bottomBar: {
    padding: 16, paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  actionBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  actionBtnDisabled: { backgroundColor: Colors.muted },
  actionBtnTxt:      { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
