import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true },
});

// ── Types ────────────────────────────────────────────────────

export type Role = 'agriculteur' | 'eleveur' | 'acheteur' | 'transporteur' | 'fournisseur';
export type RecolteStatut = 'disponible' | 'vendu' | 'archive';
export type MissionStatut = 'en_attente' | 'en_cours' | 'livree' | 'annulee';

export interface Profile {
  uuid: string;
  role: Role;
  nom_complet: string;
  telephone: string | null;
  zone: string | null;
  note_moyenne: number | null;
  created_at: string;
}

export interface Recolte {
  id: string;
  agriculteur_id: string;
  type_produit: string;
  qualite_score: number | null;
  quantite_kg: number;
  prix_fcfa_kg: number;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  statut: RecolteStatut;
  created_at: string;
  profiles?: Pick<Profile, 'nom_complet' | 'telephone' | 'zone' | 'note_moyenne'>;
}

export interface Mission {
  id: string;
  recolte_id: string;
  transporteur_id: string | null;
  acheteur_id: string | null;
  statut: MissionStatut;
  distance_km: number | null;
  tarif_fcfa: number | null;
  confirmation_vocale: boolean;
  completed_at: string | null;
  recoltes?: Pick<Recolte, 'type_produit' | 'quantite_kg' | 'prix_fcfa_kg'>;
}

// ── Constantes ───────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  mais: 'Maïs',
  riz: 'Riz',
  manioc: 'Manioc',
  igname: 'Igname',
  tomate: 'Tomate',
  banane: 'Banane',
  cacao: 'Cacao',
  cafe: 'Café',
  coton: 'Coton',
  animal: 'Animal',
  autre: 'Autre',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  mais: '🌽',
  riz: '🌾',
  manioc: '🥔',
  igname: '🍠',
  tomate: '🍅',
  banane: '🍌',
  cacao: '🍫',
  cafe: '☕',
  coton: '🌿',
  animal: '🐄',
  autre: '📦',
};

export const STATUT_MAP: Record<string, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: '#16a34a' },
  vendu: { label: 'Vendu', color: '#6b7280' },
  archive: { label: 'Archivé', color: '#9ca3af' },
  en_attente: { label: 'En attente', color: '#d97706' },
  en_cours: { label: 'En cours', color: '#2563eb' },
  livree: { label: 'Livrée', color: '#16a34a' },
  annulee: { label: 'Annulée', color: '#dc2626' },
};

export const ROLE_LABELS: Record<string, string> = {
  agriculteur: '👨‍🌾 Agriculteur',
  eleveur: '🐄 Éleveur',
  acheteur: '🛒 Acheteur',
  transporteur: '🚚 Transporteur',
  fournisseur: '🏪 Fournisseur',
};
