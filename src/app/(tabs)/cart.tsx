import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Navbar } from '../../components/Navbar';
import { ProductImage } from '../../components/ProductImage';
import {
  BottomBar,
  Button,
  Card,
  Checkbox,
  EmptyState,
  LoadingState,
  Notice,
  PageTitle,
  QuantityStepper,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage, isUnauthorized } from '../../lib/api';
import { formatRupiah } from '../../lib/format';
import type { CartItem } from '../../lib/types';
import { colors, radius, shadow } from '../../theme';

// Halaman Keranjang: pilih produk lewat checkbox & atur kuantitas, lalu checkout.
export default function CartScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user, ready } = useAuth();
  const { cart, loading, error, refresh, pullToRefresh, updateItem, removeItem, setAllSelected } =
    useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) refresh();
    }, [user, refresh]),
  );

  const run = async (productId: string | null, task: () => Promise<void>, fallback: string) => {
    if (productId) setBusyId(productId);
    else setBulkBusy(true);
    try {
      await task();
    } catch (err) {
      if (!isUnauthorized(err)) toast.show(getErrorMessage(err, fallback), { type: 'error' });
    } finally {
      setBusyId(null);
      setBulkBusy(false);
    }
  };

  const items = cart.items;
  const allSelected = items.length > 0 && items.every((i) => i.selected);

  let body: React.ReactNode = null;
  if (!ready) {
    body = <LoadingState text="Memuat keranjang belanja..." />;
  } else if (!user) {
    body = (
      <Notice message="Silakan login terlebih dahulu untuk melihat keranjang." bordered>
        <Button
          title="Ke Halaman Login"
          size="sm"
          onPress={() => router.push('/login')}
          style={{ marginTop: 12 }}
        />
      </Notice>
    );
  } else if (loading && items.length === 0) {
    body = <LoadingState text="Memuat keranjang belanja..." />;
  } else if (error && items.length === 0) {
    body = (
      <Notice message={error} bordered>
        <Button title="Coba Lagi" size="sm" onPress={refresh} style={{ marginTop: 12 }} />
      </Notice>
    );
  } else if (items.length === 0) {
    body = (
      <EmptyState
        icon="cart-outline"
        title="Keranjang belanja kamu masih kosong."
        actionLabel="Lihat Katalog Produk"
        onAction={() => router.navigate('/')}
      />
    );
  }

  if (body) {
    return (
      <View style={styles.screen}>
        <Navbar />
        <View style={styles.content}>
          <PageTitle>Keranjang Belanja</PageTitle>
          {body}
        </View>
      </View>
    );
  }

  const renderItem = ({ item }: { item: CartItem }) => {
    const id = item.product._id;
    const busy = busyId === id || bulkBusy;
    const openDetail = () => router.push({ pathname: '/product/[id]', params: { id } });
    return (
      <View style={[styles.item, busy && { opacity: 0.6 }]}>
        <Checkbox
          checked={item.selected}
          disabled={busy}
          label={`Pilih ${item.product.name}`}
          onChange={(selected) =>
            run(id, () => updateItem(id, { selected }), 'Gagal memperbarui pilihan produk.')
          }
        />
        <Pressable onPress={openDetail}>
          <ProductImage uri={item.product.imageUrl} style={styles.thumb} showLabel={false} />
        </Pressable>
        <View style={styles.itemBody}>
          <Pressable onPress={openDetail}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.name || 'Produk'}
            </Text>
          </Pressable>
          <Text style={styles.itemPrice}>{formatRupiah(item.product.price)}</Text>
          <View style={styles.itemActions}>
            <QuantityStepper
              value={item.quantity}
              max={item.product.stock}
              disabled={busy}
              onChange={(quantity) =>
                run(id, () => updateItem(id, { quantity }), 'Gagal memperbarui jumlah produk.')
              }
            />
            <Pressable
              hitSlop={8}
              disabled={busy}
              onPress={() =>
                run(id, () => removeItem(id), 'Gagal menghapus produk dari keranjang.')
              }
            >
              <Text style={styles.remove}>Hapus</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Navbar />
      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            <PageTitle>Keranjang Belanja</PageTitle>
            <Card style={styles.selectAll}>
              <Checkbox
                checked={allSelected}
                disabled={bulkBusy || !!busyId}
                label="Pilih semua"
                onChange={(next) =>
                  run(null, () => setAllSelected(next), 'Gagal memperbarui pilihan produk.')
                }
              />
              <Text style={styles.selectAllText}>Pilih Semua</Text>
              <Text style={styles.selectAllCount}>{items.length} produk</Text>
            </Card>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={pullToRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <BottomBar inTabs>
        <Text style={styles.summaryTitle}>Ringkasan Belanja</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Item</Text>
          <Text style={styles.summaryValue}>{cart.totalItems} Pcs</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Harga</Text>
          <Text style={styles.totalValue}>{formatRupiah(cart.totalPrice)}</Text>
        </View>
        <Button
          title="Lanjut ke Checkout"
          disabled={cart.totalItems === 0 || bulkBusy || !!busyId}
          onPress={() => router.push('/checkout')}
          style={{ marginTop: 8 }}
        />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  selectAllText: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  selectAllCount: { fontSize: 13, color: colors.muted },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    ...shadow.sm,
  },
  thumb: { width: 72, height: 72 },
  itemBody: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemPrice: { fontSize: 14, fontWeight: '500', color: colors.primary, marginTop: 2 },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  remove: { fontSize: 13, fontWeight: '500', color: colors.dangerText },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryLabel: { fontSize: 14, color: colors.textBody },
  summaryValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
});
