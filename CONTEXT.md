# Contexte du projet — Vibeathon 2026

## 1. Objectif du projet

Cette application est une marketplace mobile dédiée aux produits et services agricoles en Côte d’Ivoire. Elle permet aux utilisateurs de :
- consulter des produits et annonces,
- s’inscrire et se connecter,
- ajouter des produits au panier,
- passer une commande,
- suivre leurs commandes,
- gérer leur profil.

## 2. Vision produit

Le produit est pensé comme une plateforme simple et locale, avec une expérience mobile fluide, adaptée au contexte ivoirien :
- téléphones mobiles en priorité,
- devise FCFA,
- formats de téléphone local,
- interface claire et orientée achat/vente.

## 3. Stack technique

### Frontend
- Expo + React Native
- TypeScript
- Expo Router
- Zustand pour la gestion d’état
- Navigation par onglets

### Backend (BaaS)
- Supabase (PostgreSQL)
- Authentification gérée par Supabase Auth (Email/Mot de passe)
- Base de données temps réel
- Supabase Storage pour les images des récoltes
- Row Level Security (RLS) pour la sécurisation des données

## 4. Structure du dépôt

- frontend/ : application mobile Expo
- backend/ : Ancien backend Express (obsolète, remplacé par Supabase)
- supabase/ : Migrations et schémas SQL pour la base de données
- frontend/design-spec-businessOnline.md : spécification visuelle et UX du produit

## 5. Fonctionnalités déjà implémentées

### Authentification
- inscription
- connexion
- déconnexion
- validation des formulaires

### Marketplace
- liste des produits
- recherche et filtrage
- cartes produit
- offre du jour

### Panier et commandes
- ajout/suppression/modification de quantité
- calcul du total
- validation de commande
- historique des commandes

### Profil
- affichage des informations utilisateur
- état de connexion

## 6. Points techniques importants

- L'application utilise **Supabase** comme backend-as-a-service.
- Le backend local Express n'est plus utilisé en production.
- Les fichiers liés à la base de données (tables `profiles`, `recoltes`, `commandes`, etc.) sont définis via le dashboard Supabase.
- L’application frontend Expo est accessible via Metro / Expo Go (ex. `npx expo start`).
- L'authentification a été configurée avec "Confirm email" désactivé sur Supabase pour faciliter les tests sans confirmation par email.

## 7. Configuration requise (.env)

Pour faire fonctionner le projet, un fichier `.env` est nécessaire à la racine du dossier `frontend` avec les clés Supabase :
```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

## 8. Commandes utiles

### Frontend (Expo)
```bash
cd frontend
npm install
npx expo start
```

## 9. Statut actuel

Le projet est en état de prototype avancé et pleinement fonctionnel connecté à Supabase :
- interface principale avec onglets Marché, Publier, Panier, Commandes et Profil
- authentification utilisateur avec Supabase Auth et création automatique de profil (`profiles`)
- gestion des annonces de vente et des expressions de besoin (`recoltes`) avec upload d'images sur Supabase Storage
- panier fonctionnel avec ajout, suppression et modification de quantité
- validation de commande enregistrée dans la base de données Supabase (`commandes`)
- affichage de l’historique des commandes et annonces de l'utilisateur

### Améliorations futures possibles
- Gestion du paiement en ligne (Mobile Money, etc.)
- Amélioration de la gestion des erreurs réseau
- Intégration de l'assistant IA (onglet dédié)
