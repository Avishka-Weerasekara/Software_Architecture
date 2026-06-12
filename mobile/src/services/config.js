import Constants from 'expo-constants';

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:8080/api';
