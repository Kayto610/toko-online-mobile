import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { api, setAuthToken, setUnauthorizedHandler } from '../lib/api';
import * as storage from '../lib/storage';
import type { ApiResponse, AuthPayload, User } from '../lib/types';
import { useToast } from './ToastContext';

const TOKEN_KEY = 'toko.token';
const USER_KEY = 'toko.user';

interface AuthContextValue {
  user: User | null;
  /** false selama sesi lama masih dibaca dari penyimpanan */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await Promise.all([storage.removeItem(TOKEN_KEY), storage.removeItem(USER_KEY)]);
  }, []);

  const saveSession = useCallback(async ({ user: u, token }: AuthPayload) => {
    setAuthToken(token);
    setUser(u);
    await Promise.all([
      storage.setItem(TOKEN_KEY, token),
      storage.setItem(USER_KEY, JSON.stringify(u)),
    ]);
  }, []);

  // Pulihkan sesi saat app dibuka
  useEffect(() => {
    let active = true;
    (async () => {
      const [token, rawUser] = await Promise.all([
        storage.getItem(TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);
      if (!active) return;
      if (token && rawUser) {
        try {
          setAuthToken(token);
          setUser(JSON.parse(rawUser) as User);
          // validasi token ke server di belakang layar (401 -> otomatis logout)
          api
            .get<ApiResponse<User>>('/auth/me')
            .then((res) => active && setUser(res.data.data))
            .catch(() => undefined);
        } catch {
          await clearSession();
        }
      }
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [clearSession]);

  // Token kedaluwarsa -> logout + beri tahu pengguna
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      toast.show('Sesi login telah berakhir. Silakan login kembali.', { type: 'error' });
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, toast]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<ApiResponse<AuthPayload>>('/auth/login', { email, password });
      await saveSession(res.data.data);
    },
    [saveSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<ApiResponse<AuthPayload>>('/auth/register', {
        name,
        email,
        password,
      });
      await saveSession(res.data.data);
    },
    [saveSession],
  );

  const value = useMemo(
    () => ({ user, ready, login, register, logout: clearSession }),
    [user, ready, login, register, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
