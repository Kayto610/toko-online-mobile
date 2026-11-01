import { create, isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Alamat REST API toko-online-backend.
 * 1. EXPO_PUBLIC_API_URL di file .env (wajib untuk build APK), contoh:
 *    EXPO_PUBLIC_API_URL=https://toko-online-backend.vercel.app/api
 * 2. Saat development dengan Expo Go: IP komputer yang menjalankan `expo start`, port 5000.
 * 3. Cadangan: emulator Android (10.0.2.2) / localhost.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const hostUri = Constants.expoConfig?.hostUri; // contoh: "192.168.1.5:8081"
  const host = hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:5000/api`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
}

export const API_URL = resolveBaseUrl();

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Dipanggil saat token kedaluwarsa / tidak valid (HTTP 401). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const api = create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const url = error.config?.url ?? '';
      // 401 dari /auth/login berarti password salah, bukan sesi habis
      if (error.response?.status === 401 && authToken && !url.startsWith('/auth/')) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  },
);

/** Ambil pesan error dari response backend ({ success:false, message }). */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: unknown } | undefined;
    if (data && typeof data.message === 'string' && data.message) return data.message;
    if (!err.response) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet atau alamat API.';
    }
  }
  return fallback;
}

export function isUnauthorized(err: unknown): boolean {
  return isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403);
}
