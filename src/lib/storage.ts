import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Token disimpan terenkripsi di HP (SecureStore).
// Di web (hanya untuk preview) SecureStore tidak tersedia, jadi pakai localStorage.

function webStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return webStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      webStorage()?.setItem(key, value);
    } catch {
      // abaikan (mode private / storage diblokir)
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      webStorage()?.removeItem(key);
    } catch {
      // abaikan
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
