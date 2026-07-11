import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

const ROLE_MAP: Record<string, string> = {
  'Agriculteur': 'agriculteur',
  'Éleveur': 'eleveur',
  'Fournisseur d\'intrants': 'fournisseur',
  'Acheteur / Commerçant': 'acheteur',
  'Agronome': 'acheteur',
  'Autre': 'acheteur',
};

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  init: () => void;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string, phone?: string, zone?: string, roleLabel?: string) => Promise<string | null>;
  updateProfile: (data: Partial<Profile>) => Promise<string | null>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,

  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session });
      if (data.session) get().fetchProfile(data.session.user.id);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) get().fetchProfile(session.user.id);
      else set({ profile: null });
    });
  },

  fetchProfile: async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('uuid', id).single();
    if (data) set({ profile: data });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  register: async (email, password, name, phone, zone, roleLabel) => {
    const role = ROLE_MAP[roleLabel ?? ''] ?? 'acheteur';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom_complet: name,
          telephone: phone ?? null,
          zone: zone ?? null,
          role,
        },
      },
    });
    if (error) return error.message;
    if (data.user) {
      // Upsert profile immediately (in case the trigger doesn't fire fast enough)
      await supabase.from('profiles').upsert({
        uuid: data.user.id,
        nom_complet: name || email.split('@')[0],
        telephone: phone ?? null,
        zone: zone ?? null,
        role,
      }, { onConflict: 'uuid' });
    }
    // If email confirmation is disabled, session is available immediately
    // If not, data.session will be null — show a message
    if (!data.session && !error) {
      return 'Vérifiez votre email pour confirmer votre compte.';
    }
    return null;
  },

  updateProfile: async (data) => {
    const { session } = get();
    if (!session) return 'Non connecté';
    const { error } = await supabase.from('profiles').update(data).eq('uuid', session.user.id);
    if (!error) set({ profile: { ...get().profile!, ...data } });
    return error?.message ?? null;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
