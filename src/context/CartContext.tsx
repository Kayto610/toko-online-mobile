import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { api, getErrorMessage } from '../lib/api';
import type { ApiResponse, Cart } from '../lib/types';
import { useAuth } from './AuthContext';

const EMPTY_CART: Cart = { items: [], totalItems: 0, totalPrice: 0 };

interface CartContextValue {
  cart: Cart;
  /** true saat keranjang user ini belum pernah termuat, atau sedang tarik-untuk-refresh */
  loading: boolean;
  error: string;
  /** total kuantitas semua barang di keranjang (untuk badge tab) */
  itemCount: number;
  /** muat ulang diam-diam (tanpa spinner) */
  refresh: () => Promise<void>;
  /** muat ulang dengan spinner (tarik untuk refresh) */
  pullToRefresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, patch: { quantity?: number; selected?: boolean }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  setAllSelected: (selected: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

// Keranjang disimpan di server (GET/POST/PUT/DELETE /api/cart), sama seperti web.
// Setiap endpoint mengembalikan isi keranjang terbaru, jadi state cukup diganti dengan response.
// Data disimpan bersama userId-nya, sehingga saat logout / ganti akun keranjang lama
// otomatis tidak dipakai lagi.
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?._id ?? null;

  const [data, setData] = useState<{ userId: string; cart: Cart } | null>(null);
  const [failure, setFailure] = useState<{ userId: string; message: string } | null>(null);
  const [pulling, setPulling] = useState(false);

  const cart = userId && data?.userId === userId ? data.cart : EMPTY_CART;
  const error = userId && failure?.userId === userId ? failure.message : '';
  const loading = (!!userId && data?.userId !== userId && !error) || pulling;

  const save = useCallback(
    (next: Cart) => {
      if (userId) setData({ userId, cart: next });
    },
    [userId],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get<ApiResponse<Cart>>('/cart');
      setData({ userId, cart: res.data.data });
      setFailure(null);
    } catch (err) {
      setFailure({ userId, message: getErrorMessage(err, 'Gagal memuat keranjang belanja.') });
    }
  }, [userId]);

  // muat keranjang setiap user berganti (login / ganti akun)
  useEffect(() => {
    if (!userId) return;
    let active = true;
    api
      .get<ApiResponse<Cart>>('/cart')
      .then((res) => {
        if (!active) return;
        setData({ userId, cart: res.data.data });
        setFailure(null);
      })
      .catch((err) => {
        if (active) {
          setFailure({ userId, message: getErrorMessage(err, 'Gagal memuat keranjang belanja.') });
        }
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const pullToRefresh = useCallback(async () => {
    setPulling(true);
    try {
      await refresh();
    } finally {
      setPulling(false);
    }
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await api.post<ApiResponse<Cart>>('/cart', { productId, quantity });
      save(res.data.data);
    },
    [save],
  );

  const updateItem = useCallback(
    async (productId: string, patch: { quantity?: number; selected?: boolean }) => {
      const res = await api.put<ApiResponse<Cart>>(`/cart/${productId}`, patch);
      save(res.data.data);
    },
    [save],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const res = await api.delete<ApiResponse<Cart>>(`/cart/${productId}`);
      save(res.data.data);
    },
    [save],
  );

  const setAllSelected = useCallback(
    async (selected: boolean) => {
      // berurutan, supaya update ke dokumen keranjang yang sama tidak saling menimpa
      for (const item of cart.items) {
        if (item.selected !== selected) {
          const res = await api.put<ApiResponse<Cart>>(`/cart/${item.product._id}`, { selected });
          save(res.data.data);
        }
      }
    },
    [cart.items, save],
  );

  const itemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      itemCount,
      refresh,
      pullToRefresh,
      addItem,
      updateItem,
      removeItem,
      setAllSelected,
    }),
    [
      cart,
      loading,
      error,
      itemCount,
      refresh,
      pullToRefresh,
      addItem,
      updateItem,
      removeItem,
      setAllSelected,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}
