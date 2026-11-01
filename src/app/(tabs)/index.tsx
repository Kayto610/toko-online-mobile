import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Navbar } from '../../components/Navbar';
import { ProductCard } from '../../components/ProductCard';
import { Button, EmptyState, LoadingState, Notice, PageTitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { API_URL, api, getErrorMessage, isUnauthorized } from '../../lib/api';
import type { ApiResponse, Product, ProductListResponse } from '../../lib/types';
import { colors, radius } from '../../theme';

const PAGE_SIZE = 12;
type Row = Product | { _id: '__spacer' };

// Halaman Beranda: katalog produk + pencarian + filter kategori (tanpa wajib login).
export default function CatalogScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  // "loading" diturunkan dari query: true sampai hasil untuk kata kunci/kategori ini datang
  const queryKey = `${keyword}|${category}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const requestId = useRef(0); // untuk mengabaikan response lama

  // cari otomatis 400 ms setelah berhenti mengetik
  useEffect(() => {
    const t = setTimeout(() => setKeyword(searchText.trim()), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const requestPage = useCallback(
    (p: number) =>
      api.get<ProductListResponse>('/products', {
        params: {
          page: p,
          limit: PAGE_SIZE,
          keyword: keyword || undefined,
          category: category || undefined,
        },
      }),
    [keyword, category],
  );

  const applyPage = useCallback((res: ProductListResponse, p: number) => {
    const data = Array.isArray(res.data) ? res.data : [];
    setProducts((prev) =>
      p === 1 ? data : [...prev, ...data.filter((n) => !prev.some((o) => o._id === n._id))],
    );
    setPage(res.page ?? p);
    setPages(res.pages ?? 1);
    setError('');
  }, []);

  // halaman 1 dimuat ulang setiap kata kunci / kategori berubah
  useEffect(() => {
    const id = ++requestId.current;
    const key = `${keyword}|${category}`;
    requestPage(1)
      .then((res) => {
        if (id === requestId.current) applyPage(res.data, 1);
      })
      .catch((err) => {
        if (id === requestId.current) setError(getErrorMessage(err, 'Gagal memuat produk.'));
      })
      .finally(() => {
        if (id === requestId.current) setLoadedKey(key);
      });
  }, [requestPage, applyPage, keyword, category, reloadToken]);

  const retry = () => {
    setLoadedKey(null);
    setReloadToken((t) => t + 1);
  };

  const pullToRefresh = async () => {
    const id = ++requestId.current;
    setRefreshing(true);
    try {
      const res = await requestPage(1);
      if (id === requestId.current) applyPage(res.data, 1);
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err, 'Gagal memuat produk.'));
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loading || error || loadingMore || page >= pages) return;
    const id = ++requestId.current;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await requestPage(next);
      if (id === requestId.current) applyPage(res.data, next);
    } catch {
      // gagal memuat halaman berikutnya: biarkan, pengguna bisa scroll lagi
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    api
      .get<ApiResponse<string[]>>('/products/categories')
      .then((res) => setCategories(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => undefined);
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.show('Silakan login terlebih dahulu untuk menambahkan barang ke keranjang.');
      router.push('/login');
      return;
    }
    setAddingId(product._id);
    try {
      await addItem(product._id, 1);
      toast.show('Produk berhasil ditambahkan ke keranjang!', {
        type: 'success',
        action: { label: 'Lihat', onPress: () => router.navigate('/cart') },
      });
    } catch (err) {
      if (!isUnauthorized(err)) {
        toast.show(getErrorMessage(err, 'Gagal menambahkan produk ke keranjang.'), {
          type: 'error',
        });
      }
    } finally {
      setAddingId(null);
    }
  };

  // baris terakhir ganjil diberi spacer supaya kartu tidak melebar penuh
  const rows: Row[] = useMemo(
    () => (products.length % 2 === 1 ? [...products, { _id: '__spacer' }] : products),
    [products],
  );
  const filtering = !!keyword || !!category;
  const showList = !loading && !error;

  const header = (
    <View style={styles.header}>
      <PageTitle>Katalog Produk</PageTitle>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.faint} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Cari produk..."
          placeholderTextColor={colors.faint}
          returnKeyType="search"
          onSubmitEditing={() => setKeyword(searchText.trim())}
          style={styles.searchInput}
          autoCorrect={false}
        />
        {searchText ? (
          <Pressable hitSlop={8} onPress={() => setSearchText('')} accessibilityLabel="Hapus pencarian">
            <Ionicons name="close-circle" size={18} color={colors.faint} />
          </Pressable>
        ) : null}
      </View>
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {['', ...categories].map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c || 'semua'}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c || 'Semua'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <Navbar />
      <FlatList
        data={showList ? rows : []}
        keyExtractor={(item, index) => (item._id === '__spacer' ? `spacer-${index}` : item._id)}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        renderItem={({ item }) =>
          item._id === '__spacer' ? (
            <View style={{ flex: 1 }} />
          ) : (
            <ProductCard
              product={item as Product}
              adding={addingId === item._id}
              onPress={() =>
                router.push({ pathname: '/product/[id]', params: { id: item._id } })
              }
              onAddToCart={() => handleAddToCart(item as Product)}
            />
          )
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState text="Memuat katalog produk..." />
          ) : error ? (
            <Notice message={error} bordered>
              <Text style={styles.apiHint}>Server: {API_URL}</Text>
              <Button
                title="Coba Lagi"
                size="sm"
                onPress={retry}
                style={{ marginTop: 12 }}
              />
            </Notice>
          ) : filtering ? (
            <EmptyState
              icon="search-outline"
              title="Produk tidak ditemukan."
              subtitle="Coba kata kunci atau kategori lain."
            />
          ) : (
            <EmptyState
              icon="cube-outline"
              title="Belum ada produk yang tersedia."
              subtitle="Tambahkan data produk melalui database MongoDB atau REST API backend kamu."
            />
          )
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} /> : undefined
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pullToRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  column: { gap: 12 },
  header: { marginBottom: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text },
  chipsScroll: { marginTop: 12, marginHorizontal: -16 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  apiHint: { fontSize: 11, color: colors.muted, marginTop: 6, textAlign: 'center' },
});
