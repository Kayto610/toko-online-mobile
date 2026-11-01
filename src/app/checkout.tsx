import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductImage } from '../components/ProductImage';
import {
  BottomBar,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Notice,
  RadioOption,
  SectionTitle,
  TextField,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { formatRupiah } from '../lib/format';
import type { ApiResponse, Order, PaymentMethod, Product } from '../lib/types';
import { colors } from '../theme';

interface Line {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Halaman Checkout: isi alamat, pilih metode bayar, ringkasan, lalu "Konfirmasi & Bayar".
// - Dari keranjang  -> checkout semua item yang dicentang.
// - Dari "Beli Sekarang" (param productId & quantity) -> checkout 1 produk langsung.
export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ productId?: string; quantity?: string }>();
  const buyNowId = typeof params.productId === 'string' ? params.productId : undefined;
  const buyNowQty = Math.max(1, parseInt(params.quantity ?? '1', 10) || 1);

  const router = useRouter();
  const toast = useToast();
  const { user, ready } = useAuth();
  const { cart, refresh: refreshCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(!!buyNowId);
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('transfer_bank');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!buyNowId) return;
    api
      .get<ApiResponse<Product>>(`/products/${buyNowId}`)
      .then((res) => setProduct(res.data.data))
      .catch((err) => setError(getErrorMessage(err, 'Gagal memuat produk.')))
      .finally(() => setProductLoading(false));
  }, [buyNowId]);

  if (!ready) return <LoadingState text="Memuat..." />;
  if (!user) return <Redirect href="/login" />;
  if (productLoading) return <LoadingState text="Menyiapkan checkout..." />;

  const lines: Line[] = buyNowId
    ? product
      ? [
          {
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: buyNowQty,
            imageUrl: product.imageUrl,
          },
        ]
      : []
    : cart.items
        .filter((i) => i.selected)
        .map((i) => ({
          id: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
        }));

  const totalItems = lines.reduce((s, l) => s + l.quantity, 0);
  const totalPrice = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  if (lines.length === 0 && !submitting) {
    return (
      <View style={styles.padded}>
        {error ? (
          <Notice message={error} bordered />
        ) : (
          <EmptyState
            icon="bag-outline"
            title="Belum ada produk yang dipilih untuk checkout."
            actionLabel="Kembali ke Keranjang"
            onAction={() => router.back()}
          />
        )}
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!address.trim()) {
      setError('Alamat pengiriman wajib diisi');
      return;
    }
    setError('');
    setSubmitting(true);

    // 1) buat pesanan (stok dikurangi & harga dihitung di server)
    let order: Order;
    try {
      const res = await api.post<ApiResponse<Order>>('/orders', {
        shippingAddress: address.trim(),
        paymentMethod: method,
        ...(buyNowId ? { items: [{ productId: buyNowId, quantity: buyNowQty }] } : {}),
      });
      order = res.data.data;
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat pesanan.'));
      setSubmitting(false);
      return;
    }

    // 2) konfirmasi pembayaran (simulasi, tanpa payment gateway)
    try {
      await api.put(`/orders/${order._id}/pay`);
      router.replace({ pathname: '/order-success', params: { id: order._id } });
    } catch {
      toast.show('Pesanan dibuat, tetapi pembayaran gagal. Silakan coba bayar lagi.', {
        type: 'error',
      });
      router.replace({ pathname: '/order/[id]', params: { id: order._id } });
    } finally {
      refreshCart();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <SectionTitle>Alamat Pengiriman</SectionTitle>
          <View style={styles.recipient}>
            <Text style={styles.recipientName}>{user.name}</Text>
            <Text style={styles.recipientEmail}>{user.email}</Text>
          </View>
          <TextField
            label="Alamat Lengkap"
            value={address}
            onChangeText={(t) => {
              setAddress(t);
              if (error) setError('');
            }}
            placeholder="Masukkan alamat lengkap pengiriman..."
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card>
          <SectionTitle>Metode Pembayaran</SectionTitle>
          <View style={{ gap: 10 }}>
            <RadioOption
              icon="business-outline"
              label="Transfer Bank"
              description="Bayar lewat transfer rekening bank"
              selected={method === 'transfer_bank'}
              onPress={() => setMethod('transfer_bank')}
            />
            <RadioOption
              icon="wallet-outline"
              label="E-Wallet"
              description="Bayar lewat dompet digital"
              selected={method === 'e_wallet'}
              onPress={() => setMethod('e_wallet')}
            />
          </View>
        </Card>

        <Card>
          <SectionTitle>Ringkasan Pesanan</SectionTitle>
          <View style={{ gap: 12 }}>
            {lines.map((l) => (
              <View key={l.id} style={styles.line}>
                <ProductImage uri={l.imageUrl} style={styles.lineThumb} showLabel={false} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineName} numberOfLines={1}>
                    {l.name}
                  </Text>
                  <Text style={styles.lineQty}>
                    {l.quantity} x {formatRupiah(l.price)}
                  </Text>
                </View>
                <Text style={styles.lineSubtotal}>{formatRupiah(l.price * l.quantity)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Item</Text>
            <Text style={styles.rowValue}>{totalItems} Pcs</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Belanja</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalPrice)}</Text>
          </View>
        </Card>

        {error ? <Notice message={error} /> : null}
      </ScrollView>

      <BottomBar>
        <View style={styles.payRow}>
          <View>
            <Text style={styles.payLabel}>Total Bayar</Text>
            <Text style={styles.payValue}>{formatRupiah(totalPrice)}</Text>
          </View>
          <Button
            title="Konfirmasi & Bayar"
            loading={submitting}
            loadingText="Memproses..."
            onPress={handleSubmit}
            style={{ flex: 1, maxWidth: 220 }}
          />
        </View>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  padded: { padding: 16 },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  recipient: { marginBottom: 12 },
  recipientName: { fontSize: 14, fontWeight: '600', color: colors.text },
  recipientEmail: { fontSize: 13, color: colors.muted, marginTop: 1 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lineThumb: { width: 48, height: 48 },
  lineName: { fontSize: 14, fontWeight: '500', color: colors.text },
  lineQty: { fontSize: 12, color: colors.muted, marginTop: 1 },
  lineSubtotal: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  divider: { height: 1, backgroundColor: colors.surface, marginVertical: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  rowLabel: { fontSize: 14, color: colors.textBody },
  rowValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  payLabel: { fontSize: 12, color: colors.muted },
  payValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
});
