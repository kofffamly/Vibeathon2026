import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for web/iOS simulator, 10.0.2.2 for Android emulator
// For physical devices, you'd need the actual IP of your machine (e.g., 192.168.1.X)
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
  }
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
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
