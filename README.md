# AGRILINK CI — Marketplace Agricole (Vibeathon 2026)

Stack : React Native (Expo Router) + Supabase (PostgreSQL + PostGIS + RLS + Storage)

## Structure

```
Vibeathon2026/
├── supabase/migrations/
│   ├── 0001_init_schema.sql      # Tables profiles + listings (PostGIS)
│   ├── 0002_rls_policies.sql     # Row Level Security
│   ├── 0003_storage_policies.sql # Bucket "harvests"
│   └── 0004_functions.sql        # Trigger new user + nearby_listings RPC
├── backend/
│   └── index.js                  # Express (routes protégées, nearby, upload)
└── frontend/
    ├── lib/supabase.ts            # Client Supabase + types
    ├── store/
    │   ├── authStore.ts           # Auth Supabase (login/register/logout)
    │   └── cartStore.ts           # Panier local (zustand)
    ├── app/
    │   ├── (tabs)/marketplace.tsx # Annonces depuis Supabase
    │   ├── (tabs)/publish.tsx     # Publier une annonce + upload image
    │   ├── (tabs)/profile.tsx     # Profil utilisateur réel
    │   ├── listing/[id].tsx       # Détail annonce depuis Supabase
    │   ├── auth/login.tsx         # Login + Register (Supabase Auth)
    │   └── cart.tsx               # Panier
    └── components/
        ├── ListingCard.tsx
        ├── CategoryChip.tsx
        ├── ChatBubble.tsx
        ├── OrderCard.tsx
        └── StarRating.tsx
```

## 1. Supabase — Appliquer les migrations

```bash
supabase link --project-ref <ton-project-ref>
supabase db push
```

## 2. Variables d'environnement

```bash
# frontend/.env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# backend/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081
PORT=3000
```

## 3. Lancer le frontend

```bash
cd frontend
npm install
npx expo start
```

## 4. Lancer le backend (optionnel — pour nearby + upload)

```bash
cd backend
npm install
node index.js
```

## Checklist sécurité

- [x] RLS activé sur `profiles` et `listings`
- [x] `SUPABASE_SERVICE_ROLE_KEY` uniquement dans le backend
- [x] `EXPO_PUBLIC_SUPABASE_ANON_KEY` (lecture seule) dans le frontend
- [x] `.env` dans `.gitignore`
- [x] CORS limité à `ALLOWED_ORIGINS`
- [x] Bucket `harvests` : upload restreint au dossier `{auth.uid()}/...`
