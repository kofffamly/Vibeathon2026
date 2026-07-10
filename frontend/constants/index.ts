import type { Listing } from '@/data/mockData';

export type { Listing };

export type CartItem = {
  listing: Listing;
  qty:     number;
};

export type Message = {
  id:   string;
  role: 'user' | 'assistant';
  text: string;
};

export type Order = {
  id:          string;
  title:       string;
  counterpart: string;
  qty:         string;
  total:       string;
  date:        string;
  status:      'en_attente' | 'en_cours' | 'confirmee' | 'livree';
  image?:      string;
};
