import { API_URL } from '@/constants/Api';
import type { Product, Order, OrderItem, User } from '@/types';

const request = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    let error = 'Erreur serveur';
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      error = data?.error || error;
    } else {
      const text = await response.text();
      error = text || error;
    }
    throw new Error(error);
  }
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return null;
};

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const api = {
  login: async (tel: string, mdp: string) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ tel, mdp }),
    });
  },
  register: async (data: { nom: string; tel: string; localisation: string; activites: string[]; mdp: string }) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  me: async (token: string) => {
    return request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getProducts: async (query: { q?: string; category?: string; location?: string; lat?: number; lng?: number; radius?: number }) => {
    const q = buildQuery(query);
    return request(`/products${q}`) as Promise<Product[]>;
  },
  createProduct: async (token: string, product: Partial<Product>) => {
    return request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    }) as Promise<Product>;
  },
  getOrders: async (token: string) => {
    return request('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    }) as Promise<Order[]>;
  },
  placeOrder: async (token: string, payload: { items: OrderItem[]; total: number; delivery: string; paymentMethod: string }) => {
    return request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }) as Promise<Order>;
  },
};
