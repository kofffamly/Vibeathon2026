import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// IP locale de la machine de développement (doit être sur le même réseau Wi-Fi que le téléphone)
// ⚠️ Mettez à jour cette IP si vous changez de réseau Wi-Fi
const DEV_MACHINE_IP = '192.168.1.7';

const getBaseUrl = () => {
  // Emulateur Android interne (special loopback)
  if (Platform.OS === 'android' && __DEV__) {
    // Sur émulateur Android : 10.0.2.2 pointe vers le PC hôte
    // Sur téléphone physique Android : on utilise l'IP du PC
    return `http://${DEV_MACHINE_IP}:3000`;
  }
  // Web (navigateur) : localhost fonctionne
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  // iOS simulateur ou appareil physique iOS
  return `http://${DEV_MACHINE_IP}:3000`;
};

export const API_BASE_URL = getBaseUrl();

export const TOKEN_KEY = 'agromarket-auth-token';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
}
