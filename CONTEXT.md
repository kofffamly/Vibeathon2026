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

### Backend
- Node.js
- Express
- JWT pour l’authentification
- bcryptjs pour le hashage des mots de passe
- multer pour les uploads
- stockage temporaire en mémoire pour la version prototype

## 4. Structure du dépôt

- backend/ : API backend
- frontend/frontend/ : application mobile Expo
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

- L’API backend tourne localement sur http://localhost:3000
- L’application frontend Expo est accessible via Metro / Expo Go sur un port local (ex. http://localhost:8083)
- La racine `/` du backend renvoie désormais un message de santé et la liste des principales routes
- Les données sont actuellement simulées pour permettre une démonstration rapide

## 7. Routes d’API clés

- `GET http://localhost:3000/` - état du backend
- `POST http://localhost:3000/auth/register` - inscription
- `POST http://localhost:3000/auth/login` - connexion
- `GET http://localhost:3000/auth/me` - profil de l’utilisateur connecté
- `GET http://localhost:3000/products` - liste des produits
- `GET http://localhost:3000/products/:id` - détails d’un produit
- `POST http://localhost:3000/orders` - créer une commande
- `GET http://localhost:3000/orders` - récupérer les commandes de l’utilisateur
- `GET http://localhost:3000/orders/:id` - détails d’une commande
- `POST http://localhost:3000/orders/:id/pay` - marquer une commande comme payée

## 8. Commandes utiles

### Backend
```bash
cd backend
npm install
node src/server.js
```

### Frontend
```bash
cd frontend/frontend
npm install
npx expo start --localhost --clear --port 8083
```

## 9. Statut actuel

Le projet est en état de prototype fonctionnel. Les éléments suivants sont opérationnels :
- interface principale avec onglets Marché, Panier, Commandes et Profil
- authentification utilisateur (inscription / connexion)
- panier fonctionnel avec ajout, suppression et modification de quantité
- validation de commande vers le backend
- affichage de l’historique des commandes par utilisateur
- backend Express local sur `http://localhost:3000`
- frontend Expo (Metro) côté mobile

Il reste des améliorations à faire sur la persistance, la gestion des erreurs réseau et la connexion avec une base de données réelle.
