# AGRILINK CI — Marketplace Agricole (Vibeathon 2026)

Stack : React Native (Expo Router) + Supabase (PostgreSQL + PostGIS + RLS + Storage)

---

## 🚀 Tester l'application (pour les jurés et coéquipiers)

### Méthode rapide — Expo Go (5 minutes)

1. **Installe Expo Go** sur ton téléphone :
   - Android : https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS : https://apps.apple.com/app/expo-go/id982107779

2. **Clone le projet**
```bash
git clone https://github.com/<ton-repo>/Vibeathon2026.git
cd Vibeathon2026/frontend
```

3. **Configure les variables d'environnement**
```bash
cp .env.example .env
# Les clés sont déjà remplies dans .env.example, rien à modifier
```

4. **Installe et lance**
```bash
npm install
npx expo start --tunnel
```

5. **Scanne le QR code** affiché dans le terminal avec Expo Go

---

## Structure

```
Vibeathon2026/
├── supabase/migrations/
│   ├── 0001_init_schema.sql
│   ├── 0002_rls_policies.sql
│   ├── 0003_storage_policies.sql
│   └── 0004_functions.sql
├── backend/
│   └── index.js
└── frontend/
    ├── lib/supabase.ts
    ├── store/
    │   ├── authStore.ts
    │   └── cartStore.ts
    ├── app/
    │   ├── (tabs)/marketplace.tsx
    │   ├── (tabs)/publish.tsx
    │   ├── (tabs)/profile.tsx
    │   ├── listing/[id].tsx
    │   ├── auth/login.tsx
    │   └── cart.tsx
    └── components/
```

## Variables d'environnement

```bash
# frontend/.env  (copier depuis .env.example)
EXPO_PUBLIC_SUPABASE_URL=https://wwmvzmgsbcnwztdussid.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<voir .env.example>
EXPO_PUBLIC_GROQ_API_KEY=<voir .env.example>
```

## Checklist sécurité

- [x] RLS activé sur `profiles`, `recoltes`, `missions_transport`
- [x] `SUPABASE_SERVICE_ROLE_KEY` uniquement dans le backend
- [x] `EXPO_PUBLIC_SUPABASE_ANON_KEY` (lecture seule) dans le frontend
- [x] `.env` dans `.gitignore`
- [x] CORS limité à `ALLOWED_ORIGINS`
- [x] Bucket `harvests` : upload restreint au dossier `{auth.uid()}/...`
