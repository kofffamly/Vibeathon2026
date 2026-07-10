export type User = {
  id: string;
  nom: string;
  tel: string;
  localisation: string;
  activites: string[];
  role: string[];
};

export type Product = {
  id: string;
  titre: string;
  description: string;
  prixUnit: number;
  localisation: string;
  category: string;
  sellerId: string;
  emoji: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
};

export type OrderItem = {
  id: string;
  nom: string;
  localisation: string;
  prixUnit: number;
  quantite: number;
  emoji: string;
};

export type Order = {
  id: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  delivery: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
};
