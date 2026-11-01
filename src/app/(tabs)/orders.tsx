import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Navbar } from '../../components/Navbar';
import { OrderCard } from '../../components/OrderCard';
import { Button, EmptyState, LoadingState, Notice, PageTitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api, getErrorMessage, isUnauthorized } from '../../lib/api';
import type { ApiResponse, Order } from '../../lib/types';
import { colors } from '../../theme';

// Riwayat Pesanan (GET /api/orders/my) — sama dengan halaman /orders di web.
export default function OrdersScreen() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      if (mode === 'refresh') setRefreshing(true);
      try {
        const res = await api.get<ApiResponse<Order[]>>('/orders/my');
        setOrders(Array.isArray(res.data.data) ? res.data.data : []);
        setError('');
      } catch (err) {
        setError(
          isUnauthorized(err)
            ? 'Akses ditolak. Silakan login ulang.'
            : getErrorMessage(err, 'Gagal memuat riwayat pesanan.'),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  let body: React.ReactNode = null;
  if (!ready || (user && loading)) {
    body = <LoadingState text="Memuat riwayat pesanan..." />;
  } else if (!user) {
    body = (
      <Notice message="Silakan login terlebih dahulu untuk melihat riwayat pesanan." bordered>
        <Button
          title="Ke Halaman Login"
          size="sm"
          onPress={() => router.push('/login')}
          style={{ marginTop: 12 }}
        />
      </Notice>
    );
  } else if (error && orders.length === 0) {
    body = (
      <Notice message={error} bordered>
        <Button title="Coba Lagi" size="sm" onPress={() => fetchOrders()} style={{ marginTop: 12 }} />
      </Notice>
    );
  }

  return (
    <View style={styles.screen}>
      <Navbar />
      {body ? (
        <View style={styles.content}>
          <PageTitle>Riwayat Pesanan</PageTitle>
          {body}
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListHeaderComponent={<PageTitle>Riwayat Pesanan</PageTitle>}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="Belum ada transaksi atau pesanan yang dibuat."
              actionLabel="Mulai Belanja Sekarang"
              onAction={() => router.navigate('/')}
            />
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: item._id } })}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders('refresh')}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
});
