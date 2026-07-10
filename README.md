# AGRILINK CI — Marketplace Agricole (Vibeathon 2026)

Architecture cloud : PostgreSQL + PostGIS (Supabase), RLS complet, stockage sécurisé, backend Node/Express.

## 1. Appliquer les migrations Supabase

```bash
supabase link --project-ref <ton-project-ref>
supabase db push
```

Ordre des migrations :
```
supabase/migrations/0001_init_schema.sql
supabase/migrations/0002_rls_policies.sql
supabase/migrations/0003_storage_policies.sql
supabase/migrations/0004_functions.sql
```

## 2. Variables d'environnement

```bash
cp .env.example .env
# remplir avec tes vraies valeurs (jamais commit .env)
```

## 3. Lancer le backend

```bash
cd backend
npm install
node index.js
```

## 4. Lancer le frontend

```bash
cd frontend
npm install
npx expo start
```

## 5. Checklist sécurité

- [ ] RLS activé sur `profiles` et `listings`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` jamais dans le code mobile ni dans un commit
- [ ] `.env` dans `.gitignore`
- [ ] CORS limité à `ALLOWED_ORIGINS`
- [ ] Bucket `harvests` : upload restreint au dossier `{auth.uid()}/...`
