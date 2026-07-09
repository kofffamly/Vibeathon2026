import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, KeyboardTypeOptions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const TYPES = [
  { key: 'vente',  label: 'Vendre un produit',  emoji: '🏷️', desc: 'Proposez votre production à la vente' },
  { key: 'besoin', label: 'Exprimer un besoin',  emoji: '🔍', desc: 'Cherchez un produit ou partenaire' },
];

const CATEGORIES = [
  { key: 'récoltes', label: 'Récolte', emoji: '🌾' },
  { key: 'animaux',  label: 'Animal',  emoji: '🐄' },
  { key: 'intrants', label: 'Intrant', emoji: '🌱' },
  { key: 'résidus',  label: 'Résidu',  emoji: '♻️' },
];

export default function PublishScreen() {
  const router = useRouter();
  const [step,     setStep]     = useState(1);
  const [type,     setType]     = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const canContinue = (step === 1 && !!type) || (step === 2 && !!category);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => step > 1 ? setStep(s => s - 1) : router.push('/(tabs)/marketplace')}
        >
          <Feather name={step > 1 ? 'arrow-left' : 'x'} size={18} color={Colors.fg} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Publier une annonce</Text>
          <Text style={styles.headerSub}>Étape {step} sur 3</Text>
        </View>
      </View>

      {/* ── Progress ── */}
      <View style={styles.progress}>
        {[1, 2, 3].map(s => (
          <View
            key={s}
            style={[styles.progressBar, { backgroundColor: s <= step ? Colors.primary : Colors.muted }]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Step 1 — Type */}
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
                <View style={[styles.typeIcon, type === t.key && styles.typeIconActive]}>
                  <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeLabel, type === t.key && { color: Colors.primary }]}>{t.label}</Text>
                  <Text style={styles.typeDesc}>{t.desc}</Text>
                </View>
                {type === t.key && (
                  <View style={styles.checkMark}>
                    <Feather name="check" size={14} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2 — Category */}
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
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, category === cat.key && { color: Colors.primary }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3 — Form */}
        {step === 3 && (
          <View style={{ gap: 16 }}>
            <Text style={styles.stepTitle}>Détails de l'annonce</Text>
            <Text style={styles.stepSub}>Complétez les informations.</Text>

            <TouchableOpacity style={styles.photoBox}>
              <Text style={{ fontSize: 22, marginBottom: 8 }}>📷</Text>
              <Text style={styles.photoTxt}>Ajouter des photos</Text>
              <Text style={styles.photoSub}>Jusqu'à 5 photos (recommandé)</Text>
            </TouchableOpacity>

            <Field label="TITRE DE L'ANNONCE" placeholder="Ex: Maïs local – récolte 2024" />
            <Field label="DESCRIPTION" placeholder="Décrivez votre produit..." multiline />

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="QUANTITÉ" placeholder="Ex: 50 sacs" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="PRIX (FCFA)" placeholder="Ex: 1 200" keyboardType="numeric" />
              </View>
            </View>

            <Field label="LOCALISATION" placeholder="Ville / Village" icon="map-pin" />

            <TouchableOpacity
              style={styles.publishBtn}
              onPress={() => router.push('/(tabs)/marketplace')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.publishGrad}>
                <Text style={styles.publishTxt}>✨ Publier l'annonce</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Next button (steps 1 & 2) ── */}
      {step < 3 && (
        <View style={styles.nextBar}>
          <TouchableOpacity
            style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
            onPress={() => canContinue && setStep(s => s + 1)}
            activeOpacity={canContinue ? 0.85 : 1}
          >
            {canContinue ? (
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.nextGrad}>
                <Text style={styles.nextTxt}>Continuer →</Text>
              </LinearGradient>
            ) : (
              <View style={styles.nextGrad}>
                <Text style={[styles.nextTxt, { color: Colors.mutedFg }]}>Continuer →</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

interface FieldProps {
  label:        string;
  placeholder:  string;
  multiline?:   boolean;
  icon?:        string;
  keyboardType?: KeyboardTypeOptions;
}

function Field({ label, placeholder, multiline, icon, keyboardType }: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View>
        <TextInput
          style={[styles.fieldInput, multiline && { minHeight: 90, textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedFg}
          multiline={multiline}
          keyboardType={keyboardType}
        />
        {icon && (
          <View style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}>
            <Feather name={icon as any} size={16} color={Colors.mutedFg} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerBtn:   { backgroundColor: Colors.bg, borderRadius: 10, padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.fg },
  headerSub:   { fontSize: 12, color: Colors.mutedFg, fontWeight: '500' },
  progress:    { flexDirection: 'row', gap: 6, padding: 16, paddingBottom: 0, backgroundColor: Colors.white },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  content:     { padding: 24, paddingBottom: 48 },
  stepTitle:   { fontSize: 22, fontWeight: '700', color: Colors.fg },
  stepSub:     { fontSize: 13, color: Colors.mutedFg, fontWeight: '500', marginBottom: 8 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 18, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  typeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  typeIcon:       { width: 50, height: 50, borderRadius: 14, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  typeIconActive: { backgroundColor: Colors.primary },
  typeLabel:      { fontSize: 15, fontWeight: '800', color: Colors.fg },
  typeDesc:       { fontSize: 12, color: Colors.mutedFg, fontWeight: '500', marginTop: 2 },
  checkMark:      { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  catGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47.5%', paddingVertical: 20, paddingHorizontal: 12,
    borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.white, alignItems: 'center',
  },
  catCardActive:  { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  catLabel:       { fontSize: 13, fontWeight: '800', color: Colors.fg },
  photoBox: {
    borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
    borderStyle: 'dashed', backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 28,
  },
  photoTxt:    { fontSize: 13, fontWeight: '700', color: Colors.primary },
  photoSub:    { fontSize: 11, color: Colors.mutedFg, marginTop: 2 },
  twoCol:      { flexDirection: 'row', gap: 10 },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: Colors.mutedFg, letterSpacing: 0.7 },
  fieldInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 14, color: Colors.fg, fontWeight: '500',
  },
  publishBtn:  { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  publishGrad: { paddingVertical: 17, alignItems: 'center' },
  publishTxt:  { color: Colors.white, fontSize: 16, fontWeight: '800' },
  nextBar:     { padding: 16, paddingBottom: 32, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  nextBtn:     { borderRadius: 14, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextGrad:    { paddingVertical: 16, alignItems: 'center', backgroundColor: Colors.muted },
  nextTxt:     { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
