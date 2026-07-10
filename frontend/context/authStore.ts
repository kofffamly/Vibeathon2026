import { create } from 'zustand';

// ── Règles de validation ──────────────────────────────────────────

export function validatePhone(tel: string): string | null {
  const digits = tel.replace(/\s/g, '');
  if (!digits) return 'Le numéro de téléphone est requis';
  if (!/^\d+$/.test(digits)) return 'Le numéro ne doit contenir que des chiffres';
  if (digits.length !== 10) return 'Le numéro doit contenir 10 chiffres';
  if (!/^(01|05|07)/.test(digits)) return 'Numéro invalide (commence par 01, 05 ou 07)';
  return null;
}

export function validatePassword(mdp: string): string | null {
  if (!mdp) return 'Le mot de passe est requis';
  if (mdp.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
  return null;
}

export function validateNom(nom: string): string | null {
  if (!nom.trim()) return 'Le nom complet est requis';
  if (nom.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères';
  return null;
}

export function validateLocalisation(loc: string): string | null {
  if (!loc.trim()) return 'La localisation est requise';
  return null;
}

export function validateActivites(activites: string[]): string | null {
  if (activites.length === 0) return 'Sélectionnez au moins un type d\'activité';
  return null;
}

export function validateLoginForm(tel: string, mdp: string) {
  return {
    tel: validatePhone(tel),
    mdp: validatePassword(mdp),
  };
}

export function validateRegisterForm(
  nom: string,
  tel: string,
  localisation: string,
  activites: string[],
  mdp: string
) {
  return {
    nom: validateNom(nom),
    tel: validatePhone(tel),
    localisation: validateLocalisation(localisation),
    activites: validateActivites(activites),
    mdp: validatePassword(mdp),
  };
}

export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some(e => e !== null);
}

// ── Store auth ────────────────────────────────────────────────────

type AuthStore = {
  isLoggedIn: boolean;
  user: { nom: string; tel: string; role: string[] } | null;
  login: (tel: string, mdp: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    nom: string; tel: string; localisation: string;
    activites: string[]; mdp: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,

  login: async (tel, mdp) => {
    const errors = validateLoginForm(tel, mdp);
    if (hasErrors(errors)) {
      return { success: false, error: 'Formulaire invalide' };
    }
    // Simulation appel API
    await new Promise(r => setTimeout(r, 500));
    set({ isLoggedIn: true, user: { nom: 'Amadou Koné', tel, role: ['Agriculteur'] } });
    return { success: true };
  },

  register: async ({ nom, tel, localisation, activites, mdp }) => {
    const errors = validateRegisterForm(nom, tel, localisation, activites, mdp);
    if (hasErrors(errors)) {
      return { success: false, error: 'Formulaire invalide' };
    }
    // Simulation appel API
    await new Promise(r => setTimeout(r, 500));
    set({ isLoggedIn: true, user: { nom, tel, role: activites } });
    return { success: true };
  },

  logout: () => set({ isLoggedIn: false, user: null }),
}));
