# AGRILINK CI — Marketplace Agricole Côte d'Ivoire
## Vibeathon 2026 — Équipe 5

> **Plateforme d'économie circulaire agricole** connectant agriculteurs, éleveurs, ménages, recycleurs et grossistes pour atteindre le "Zéro Déchet" grâce à l'IA.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Expo CLI
- Compte Supabase (déjà configuré : `wwmvzmgsbcnwztdussid.supabase.co`)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Remplir les variables
node index.js
# → Serveur sur http://localhost:3000
# → Statut : http://localhost:3000/status
```

### Frontend Mobile (Expo)
```bash
cd frontend
npm install
cp .env.example .env   # Remplir EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start --localhost --clear --port 8083
# → Scanner le QR Code avec Expo Go
```

### Base de données (Supabase)
Appliquer les migrations dans l'ordre via le SQL Editor de Supabase :
```
supabase/migrations/0001_init_schema.sql        ← Tables de base
supabase/migrations/0002_rls_policies.sql       ← Sécurité
supabase/migrations/0003_storage_policies.sql   ← Photos
supabase/migrations/0004_functions.sql          ← PostGIS + triggers
supabase/migrations/0005_orders_messages.sql    ← Commandes + Chat
supabase/migrations/0006_fix_trigger_profiles.sql
supabase/migrations/0007_production_sync.sql
supabase/migrations/0008_fix_nullable_coords.sql
supabase/migrations/0009_fix_fk_trigger.sql
supabase/migrations/0010_fix_select_policies.sql
supabase/migrations/0011_reviews.sql            ← Avis vendeurs
supabase/migrations/0012_notifications.sql      ← Notifications in-app
supabase/migrations/0013_seller_stats.sql       ← Statistiques
supabase/migrations/0014_demo_seed.sql          ← Données de démo
```

---

## 🏗 Architecture

```
Vibeathon2026/
├── frontend/          ← Application Expo (React Native + TypeScript)
│   ├── app/           ← Routes Expo Router
│   │   ├── (tabs)/    ← Onglets : Marché, Publier, Commandes, Profil
│   │   ├── auth/      ← Connexion / Inscription
│   │   └── listing/   ← Détail d'une annonce
│   ├── components/    ← Composants réutilisables
│   ├── store/         ← État global (Zustand)
│   └── lib/           ← Client Supabase
│
├── backend/           ← API Express (Node.js)
│   └── index.js       ← Toutes les routes API
│
└── supabase/
    └── migrations/    ← 14 scripts SQL (schema → seed démo)
```

---

## 📡 Routes API (Backend)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/status` | Santé du serveur | Non |
| GET | `/api/stats` | Stats globales de la plateforme | Non |
| GET | `/api/listings` | Liste des annonces actives | Non |
| GET | `/api/listings/:id` | Détail d'une annonce | Non |
| POST | `/api/listings` | Créer une annonce | ✅ |
| GET | `/api/listings/nearby` | Annonces par proximité GPS | Non |
| POST | `/api/orders` | Créer une commande | ✅ |
| GET | `/api/orders` | Mes commandes | ✅ |
| GET | `/api/orders/:id` | Détail d'une commande | ✅ |
| PATCH | `/api/orders/:id/status` | Changer le statut | ✅ |
| GET | `/api/messages/:listing_id` | Messages d'une annonce | ✅ |
| POST | `/api/messages` | Envoyer un message | ✅ |
| GET | `/api/profile` | Mon profil | ✅ |
| PATCH | `/api/profile` | Modifier mon profil | ✅ |
| GET | `/api/notifications` | Mes notifications | ✅ |
| PATCH | `/api/notifications/read-all` | Tout marquer comme lu | ✅ |
| POST | `/api/reviews` | Laisser un avis | ✅ |
| GET | `/api/reviews/:seller_id` | Avis d'un vendeur | Non |
| POST | `/api/ai/analyze` | Analyse IA d'une photo | ✅ |

---

## 👥 Équipe

| Membre | Rôle | Mission |
|--------|------|---------|
| **Edja Mira (M1)** | Dev Frontend | Interface mobile Expo, composants UI |
| **Kouadio Herman (M2)** | Dev Frontend | Logique state management, intégration |
| **Oladokou Joseph (M3)** | Dev Backend | Serveur Express, routes API |
| **Coulibaly Fangapele (M4)** | Dev Base de données | Schema Supabase, migrations, sécurité RLS |
| **Koffi Yao Mondesir (M5)** | Scrum Master | Git, coordination, intégration continue |

---

## 🔐 Variables d'environnement

### Backend (`backend/.env`)
```
SUPABASE_URL=https://wwmvzmgsbcnwztdussid.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
PORT=3000
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:8083,exp://localhost:8081
```

### Frontend (`frontend/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://wwmvzmgsbcnwztdussid.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9eCW0RHoFOtjR4uvxvn2SQ_c1gHDflI
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 📱 Fonctionnalités

- ✅ **Marketplace** : Annonces de récoltes, animaux, intrants, résidus agricoles
- ✅ **Géolocalisation** : Annonces triées par proximité (PostGIS)
- ✅ **Commandes** : Panier, validation, suivi des commandes
- ✅ **Chat** : Messagerie acheteur ↔ vendeur par annonce
- ✅ **Avis** : Notation des vendeurs (1-5 étoiles)
- ✅ **Notifications** : Alertes temps réel (nouvelles commandes, messages)
- ✅ **IA Gemini** : Analyse automatique de photos de produits
- ✅ **Sécurité** : JWT Supabase, RLS PostgreSQL, CORS strict, rate-limiting

---

*Vibeathon 2026 — "Zéro Déchet, Maximum d'Impact" 🌱*
