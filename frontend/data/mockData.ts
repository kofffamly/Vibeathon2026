export type Listing = {
  id: string;
  title: string;
  price: number | string; // number from backend, string from mock data
  unit?: string;
  image: string;
  location: string;
  category: string;
  badge?: string;
  sellerRating?: number;
  emoji?: string;
  seller?: string;
  description?: string;
  lat?: number;
  lng?: number;
};

export type Category = {
  key: string;
  emoji: string;
  label: string;
};

export const CATEGORIES: Category[] = [
  { key: 'all',      emoji: '🌍', label: 'Tout' },
  { key: 'récoltes', emoji: '🌽', label: 'Récoltes' },
  { key: 'animaux',  emoji: '🐄', label: 'Animaux' },
  { key: 'intrants', emoji: '🌱', label: 'Intrants' },
  { key: 'résidus',  emoji: '🌾', label: 'Résidus' },
];

export type OrderData = {
  id:          string;
  title:       string;
  counterpart: string;
  qty:         string;
  total:       string;
  date:        string;
  status:      'en_attente' | 'en_cours' | 'confirmee' | 'livree';
  image?:      string;
};

export const BUYER_ORDERS: OrderData[] = [
  {
    id: 'b1',
    title: 'Maïs local — récolte 2024',
    counterpart: 'Koné Amadou',
    qty: '5 sacs',
    total: '6 000 FCFA',
    date: '12 jan. 2025',
    status: 'en_cours',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=200&h=200&fit=crop&auto=format',
  },
  {
    id: 'b2',
    title: 'Engrais NPK certifié',
    counterpart: 'AgroShop CI',
    qty: '2 sacs',
    total: '50 000 FCFA',
    date: '8 jan. 2025',
    status: 'livree',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&auto=format',
  },
  {
    id: 'b3',
    title: 'Bœufs zébus — race locale',
    counterpart: 'Diallo Seydou',
    qty: '1 tête',
    total: '180 000 FCFA',
    date: '3 jan. 2025',
    status: 'en_attente',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&h=200&fit=crop&auto=format',
  },
];

export const SELLER_ORDERS: OrderData[] = [
  {
    id: 's1',
    title: 'Paille de riz séchée',
    counterpart: 'Traoré Moussa',
    qty: '10 bottes',
    total: '35 000 FCFA',
    date: '11 jan. 2025',
    status: 'en_attente',
  },
  {
    id: 's2',
    title: 'Paille de riz séchée',
    counterpart: 'Coulibaly Awa',
    qty: '4 bottes',
    total: '14 000 FCFA',
    date: '5 jan. 2025',
    status: 'confirmee',
  },
];

export const AI_SUGGESTIONS: string[] = [
  'Quel engrais utiliser pour le maïs ?',
  'Comment protéger mes cultures contre les insectes ?',
  'Quelle est la meilleure période pour semer le riz ?',
  'Comment améliorer la santé de mon bétail ?',
  'Quels sont les prix du marché cette semaine ?',
];

const AI_RESPONSES: Record<string, string> = {
  engrais:   'Pour le maïs, privilégiez un engrais NPK (15-15-15) au semis, puis un apport azoté (urée) 30 jours après. Dosage recommandé : 200 kg/ha. 🌽',
  insectes:  "Utilisez des pesticides homologués à base de lambda-cyhalothrine pour les chenilles légionnaires. Traitez tôt le matin ou le soir pour plus d'efficacité. 🌿",
  riz:       "La meilleure période de semis du riz en Côte d'Ivoire est avril-mai pour la grande saison et septembre-octobre pour la petite saison. 🌾",
  bétail:    "Assurez une vaccination régulière (PPCB, FMD), un déparasitage tous les 3 mois et un accès permanent à l'eau propre. Consultez un vétérinaire local. 🐄",
  prix:      "Les prix varient selon les régions. Consultez l'onglet Marché pour les annonces en temps réel. Le maïs est actuellement à 1 200 FCFA/sac à Korhogo. 📊",
};

export function getAIResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('engrais') || q.includes('fertilisant')) return AI_RESPONSES.engrais;
  if (q.includes('insecte') || q.includes('parasite') || q.includes('pest')) return AI_RESPONSES.insectes;
  if (q.includes('riz') || q.includes('semer') || q.includes('semis')) return AI_RESPONSES.riz;
  if (q.includes('bétail') || q.includes('vache') || q.includes('élevage')) return AI_RESPONSES.bétail;
  if (q.includes('prix') || q.includes('marché') || q.includes('coût')) return AI_RESPONSES.prix;
  return 'Bonne question ! Je vous conseille de consulter un agronome local ou de poster votre question dans la communauté AgroMarket pour obtenir des réponses adaptées à votre région. 🌱';
}

export const LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Maïs local — récolte 2024',
    price: '1 200 FCFA',
    unit: '/sac',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=300&fit=crop&auto=format',
    location: 'Korhogo',
    category: 'récoltes',
    badge: 'Populaire',
    sellerRating: 4.8,
  },
  {
    id: '2',
    title: 'Bœufs zébus — race locale',
    price: '180 000 FCFA',
    unit: '/tête',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop&auto=format',
    location: 'Bouaké',
    category: 'animaux',
    sellerRating: 4.6,
  },
  {
    id: '3',
    title: 'Engrais NPK certifié',
    price: '25 000 FCFA',
    unit: '/sac',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&auto=format',
    location: 'Abidjan',
    category: 'intrants',
    badge: 'Certifié',
    sellerRating: 4.9,
  },
  {
    id: '4',
    title: 'Paille de riz séchée',
    price: '3 500 FCFA',
    unit: '/botte',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&auto=format',
    location: 'Yamoussoukro',
    category: 'résidus',
    sellerRating: 4.5,
  },
];
