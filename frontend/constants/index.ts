export type { Listing, Profile, Order, OrderItem, Message, OrderStatus, PaymentMethod } from '@/lib/supabase';

export type ChatMessage = {
  id:   string;
  role: 'user' | 'assistant';
  text: string;
};

export type CartItem = {
  listing: import('@/lib/supabase').Listing;
  qty:     number;
};
