import { Platform } from 'react-native';

export const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  web: 'http://localhost:3000',
  default: 'http://localhost:3000',
}) || 'http://localhost:3000';
