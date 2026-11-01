import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductImage } from '../../components/ProductImage';
import {
  BottomBar,
  Button,
  Card,
  LoadingState,
  Notice,
  QuantityStepper,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { api, getErrorMessage, isUnauthorized } from '../../lib/api';
import { formatRupiah } from '../../lib/format';
import type { ApiResponse, Product } from '../../lib/types';
import { colors, radius } from '../../theme';

// Halaman Detail Produk: foto, deskripsi lengkap, harga, jumlah, "+ Keranjang" / "Beli Sekarang".
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get<ApiResponse<Product>>(`/products/${id}`)
      .then((res) => {
        if (!active) return;
        setProduct(res.data.data);
        setError('');
      })
      .catch((err) => active && setError(getErrorMessage(err, 'Gagal memuat detail produk.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  const requireLogin = () => {
    toast.show('Silakan login terlebih dahulu untuk melanjutkan.');
    router.push('/login');
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) return requireLogin();
    setAdding(true);
    try {
      await addItem(product._id, quantity);
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
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) return requireLogin();
    router.push({
      pathname: '/checkout',
      params: { productId: product._id, quantity: String(quantity) },
    });
  };

  if (loading) return <LoadingState text="Memuat detail produk..." />;

  if (error || !product) {
    return (
      <View style={styles.padded}>
        <Notice message={error || 'Produk tidak ditemukan.'} bordered>
          <Button
            title="Coba Lagi"
            size="sm"
            onPress={() => {
              setLoading(true);
              setReloadToken((t) => t + 1);
            }}
            style={{ marginTop: 12 }}
          />
        </Notice>
      </View>
    );
  }

  const soldOut = product.stock <= 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProductImage uri={product.imageUrl} style={styles.image} />

        <Card style={styles.infoCard}>
          {product.category ? (
            <View style={styles.category}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          ) : null}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatRupiah(product.price)}</Text>
          <View style={styles.stock}>
            <Text style={styles.stockText}>
              {soldOut ? 'Stok habis' : `Stok: ${product.stock}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Deskripsi Produk</Text>
          <Text style={styles.description}>{product.description}</Text>

          {!soldOut && (
            <>
              <View style={styles.divider} />
              <View style={styles.qtyRow}>
                <Text style={styles.sectionLabel}>Jumlah</Text>
                <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock} />
              </View>
            </>
          )}
        </Card>
      </ScrollView>

      <BottomBar>
        <View style={styles.actions}>
          <Button
            title="+ Keranjang"
            variant="outline"
            onPress={handleAddToCart}
            loading={adding}
            disabled={soldOut}
            style={{ flex: 1 }}
          />
          <Button
            title={soldOut ? 'Stok Habis' : 'Beli Sekarang'}
            onPress={handleBuyNow}
            disabled={soldOut || adding}
            style={{ flex: 1 }}
          />
        </View>
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  padded: { padding: 16 },
  content: { padding: 16, paddingBottom: 24 },
  image: { width: '100%', aspectRatio: 1, borderRadius: radius.xl },
  infoCard: { marginTop: 16 },
  category: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  categoryText: { fontSize: 12, fontWeight: '500', color: colors.primaryPressed },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  price: { fontSize: 22, fontWeight: '700', color: colors.primary, marginTop: 6 },
  stock: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  stockText: { fontSize: 12, fontWeight: '500', color: colors.muted },
  divider: { height: 1, backgroundColor: colors.surface, marginVertical: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  description: { fontSize: 14, lineHeight: 21, color: colors.textBody, marginTop: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 12 },
});
