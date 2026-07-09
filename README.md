# AGRILINK CI — Schéma Supabase & backend sécurisé

Architecture cloud pour la marketplace agricole : PostgreSQL + PostGIS (Supabase),
RLS complet, stockage sécurisé, backend Node/Express avec CORS restreint.

## 1. Appliquer les migrations

Dans l'ordre, via le SQL Editor de Supabase (ou `supabase db push` si tu utilises la CLI) :

```
supabase/migrations/0001_init_schema.sql       -- tables profiles + listings
supabase/migrations/0002_rls_policies.sql      -- sécurité ligne par ligne
supabase/migrations/0003_storage_policies.sql  -- bucket photos sécurisé
supabase/migrations/0004_functions.sql         -- trigger inscription + tri distance
```

Avec la CLI Supabase :
```bash
supabase link --project-ref <ton-project-ref>
supabase db push
```

## 2. Variables d'environnement

```bash
cp .env.example .env
# puis remplir avec tes vraies valeurs (jamais commit .env)
```

## 3. Lancer le serveur

```bash
cd server
npm install express cors dotenv @supabase/supabase-js @google/generative-ai
node index.js
```

## 4. Appel côté client (React Native / Expo)

Inscription avec géolocalisation transmise au trigger `handle_new_user` :
```js
await supabase.auth.signUp({
  email, password,
  options: {
    data: {
      full_name: 'Fangapelé',
      phone: '+2250709272227',
      role: 'agriculteur',
      lat: 6.827, lng: -5.289,
    },
  },
});
```

Requête marketplace triée par proximité (via le backend, pas d'appel direct RPC
avec la service_role depuis le mobile) :
```js
const res = await fetch(`${API_URL}/api/listings/nearby?lat=${lat}&lng=${lng}&category=residu`, {
  headers: { Authorization: `Bearer ${session.access_token}` },
});
```

## 5. Checklist sécurité (à ne pas sauter même en mode hackathon)

- [ ] RLS activé sur `profiles` et `listings` (fait par 0002, vérifier dans le dashboard
      Supabase que le cadenas est bien fermé sur chaque table).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` : jamais dans le code mobile, jamais dans un commit,
      jamais loguée en clair.
- [ ] `.env` dans `.gitignore` (déjà fait) — vérifier avec `git status` avant chaque commit.
- [ ] CORS du serveur Node limité à `ALLOWED_ORIGINS`, pas de `cors()` sans argument.
- [ ] Bucket `harvests` : upload restreint au dossier `{auth.uid()}/...` de chaque
      utilisateur (0003), pas d'écriture libre dans tout le bucket.
- [ ] Le parsing de la réponse Gemini est tolérant (regex sur `{...}`) pour éviter
      un crash serveur si l'IA renvoie du texte parasite autour du JSON.

## 6. Pousser sur GitHub

```bash
git init
git add .
git status   # vérifier qu'aucun .env n'apparaît dans la liste
git commit -m "feat: schema Supabase PostGIS + RLS + backend securise"
git branch -M main
git remote add origin https://github.com/<ton-org>/agrilink-ci.git
git push -u origin main
```

Si un secret a été commit par erreur avant d'ajouter le `.gitignore`, ne fais pas
un simple nouveau commit de suppression : le secret reste dans l'historique.
Utilise `git filter-repo` (ou BFG Repo-Cleaner) pour le purger, puis force-push,
et régénère la clé côté Supabase dans tous les cas.
