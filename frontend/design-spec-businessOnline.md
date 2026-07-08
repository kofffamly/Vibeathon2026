# Design Spec — businessOnline (extrait des maquettes)

## 1. Palette de couleurs

| Usage | Couleur (approx.) | Où |
|---|---|---|
| Vert principal (fond header, boutons pleins, badges actifs) | `#1B4332` / `#1E4D3A` (vert forêt foncé) | Fond des écrans Connexion/Inscription, boutons "Se connecter", "Créer mon compte", tab active |
| Vert secondaire (accents, icônes) | `#2D6A4F` | Bordures, icônes actives bottom nav |
| Crème / beige (fond des écrans contenu) | `#F5F0E6` / `#FAF7F0` | Fond des écrans Panier, Commandes, Profil |
| Blanc | `#FFFFFF` | Cartes, champs de saisie, boutons secondaires |
| Texte foncé | `#1A1A1A` / `#2B2B2B` | Titres |
| Texte gris | `#6B7280` | Sous-titres, labels |
| Accent orange/statut "en route" | `#F59E0B` (à vérifier sur les captures) | Badges de statut commande |
| Vert badge "Livré" | `#22C55E` sur fond `#DCFCE7` | Statuts commandes |

## 2. Typographie

- Titres d'écran ("Bon retour !", "Rejoignez-nous", "Mon panier") : gras, ~22-24px, blanc sur fond vert / noir sur fond crème
- Sous-titres ("Connectez-vous à votre compte") : regular, ~14px, gris clair/blanc atténué
- Labels de champs (NUMÉRO DE TÉLÉPHONE, MOT DE PASSE) : petites majuscules, gras, ~11-12px, gris
- Texte des champs : regular, ~15px

## 3. Composants récurrents

### Toggle Connexion/Inscription
- Pill container blanc/translucide avec deux segments, segment actif en blanc avec texte vert foncé, segment inactif transparent avec texte blanc

### Champs de saisie (inputs)
- Fond blanc, coins arrondis (~12px radius), label au-dessus en petites majuscules
- Champ téléphone : préfixe fixe `+225` suivi du numéro, format placeholder `07 00 00 00 00`
- Champ mot de passe : icône œil à droite pour afficher/masquer

### Boutons
- Bouton principal (plein vert foncé, texte blanc, coins très arrondis ~28px, pleine largeur) : "Se connecter", "Créer mon compte", "Valider la commande"
- Bouton secondaire (blanc, bordure fine, icône) : "Continuer avec WhatsApp"

### Chips de sélection (Type d'activité, écran Inscription)
- Multi-select, coins arrondis, fond vert clair transparent quand sélectionné, bordure grise quand non sélectionné
- Exemples: Agriculteur, Éleveur, Fournisseur d'intrants, Acheteur/Commerçant, Agronome, Autre

### Bottom Navigation (5 items)
- Icônes : Marché (accueil), bouton central "+" (vert, flottant, surélevé), Panier (avec badge compteur), Commandes, Profil
- Item actif : icône + label en vert foncé ; inactifs : gris

### Cartes produit/commande (liste)
- Image miniature à gauche (coins arrondis), infos à droite (titre, vendeur/quantité, prix en FCFA), badge de statut coloré à droite (En route / Livré)

### Écran Profil
- Header vert foncé avec avatar (initiales sur fond clair), nom, rôle ("Agriculteur · Éleveur"), localisation
- Bandeau stats horizontal (icône + chiffre + label) : Annonces / Ventes / Note / Membre depuis
- Bouton "Modifier" en haut à droite (pill blanc/vert clair)
- Liste de sections avec icône + libellé + chevron : Mes avis, Assistant IA, Notifications, Localisation, Sécurité, Aide & Support, Déconnexion (en rouge)

## 4. Formatage spécifique Côte d'Ivoire

- Téléphone : indicatif `+225` fixe, format d'affichage `07 00 00 00 00` (2 chiffres groupés)
- Devise : `FCFA` toujours après le montant, montants en milliers avec espace comme séparateur (`180 000 FCFA`, `6 000 FCFA`)

## 5. Écrans prioritaires pour toi (tâches assignées)

1. **Connexion** (Image 1) — toggle + tél/mdp + bouton + option WhatsApp
2. **Inscription** (Image 2) — toggle + nom/tél/localisation/type activité (chips)/mdp
3. **Profil - vue** (Image 6) — header stats + liste annonces
4. **Profil - édition** (Image 7, bouton "Modifier") — probablement les mêmes champs qu'inscription mais pré-remplis
5. **Panier** (Image 3) — liste articles + quantité +/- + récapitulatif + bouton valider

(Commandes et confirmation de commande semblent hors de ton périmètre — à confirmer avec ton collègue)
