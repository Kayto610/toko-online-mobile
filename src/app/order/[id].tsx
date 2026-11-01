import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { OrderCard } from '../../components/OrderCard';
import {
  BottomBar,
  Button,
  Card,
  LoadingState,
  Notice,
  SectionTitle,
  StatusBadge,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, getErrorMessage } from '../../lib/api';
import { PAYMENT_LABEL, formatDateTime } from '../../lib/format';
import type { ApiResponse, Order, OrderStatus } from '../../lib/types';
import { colors } from '../../theme';

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: 'Menunggu pembayaran',
  paid: 'Pembayaran diterima, pesanan sedang disiapkan',
  shipped: 'Pesanan sedang dikirim',
  completed: 'Pesanan selesai',
  cancelled: 'Pesanan dibatalkan',
};

// Detail pesanan + bayar (PUT /orders/:id/pay) atau batalkan (PUT /orders/:id/cancel).
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user, ready } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<'pay' | 'cancel' | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const [reloadToken, setReloadToken] = useState(0);
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    api
      .get<ApiResponse<Order>>(`/orders/${id}`)
      .then((res) => {
        if (!active) return;
        setOrder(res.data.data);
        setError('');
      })
      .catch((err) => active && setError(getErrorMessage(err, 'Gagal memuat detail pesanan.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, userId, reloadToken]);

  if (!ready) return <LoadingState text="Memuat..." />;
  if (!user) return <Redirect href="/login" />;
  if (loading) return <LoadingState text="Memuat detail pesanan..." />;
  if (error || !order) {
    return (
      <View style={styles.padded}>
        <Notice message={error || 'Pesanan tidak ditemukan.'} bordered>
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

  const pay = async () => {
    setAction('pay');
    try {
      await api.put<ApiResponse<Order>>(`/orders/${order._id}/pay`);
      router.replace({ pathname: '/order-success', params: { id: order._id } });
    } catch (err) {
      toast.show(getErrorMessage(err, 'Pembayaran gagal.'), { type: 'error' });
    } finally {
      setAction(null);
    }
  };

  const cancel = async () => {
    setAction('cancel');
    try {
      const res = await api.put<ApiResponse<Order>>(`/orders/${order._id}/cancel`);
      setOrder(res.data.data);
      setConfirmCancel(false);
      toast.show('Pesanan dibatalkan. Stok produk sudah dikembalikan.', { type: 'success' });
    } catch (err) {
      toast.show(getErrorMessage(err, 'Gagal membatalkan pesanan.'), { type: 'error' });
    } finally {
      setAction(null);
    }
  };

  const pending = order.status === 'pending';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.statusCard}>
          <StatusBadge status={order.status} />
          <Text style={styles.statusText}>{STATUS_TEXT[order.status] ?? order.status}</Text>
        </Card>

        <OrderCard order={order} />

        <Card>
          <SectionTitle>Informasi Pesanan</SectionTitle>
          <Info label="Alamat Pengiriman" value={order.shippingAddress} />
          <Info label="Metode Pembayaran" value={PAYMENT_LABEL[order.paymentMethod]} />
          <Info label="Dibuat" value={formatDateTime(order.createdAt)} />
          {order.paidAt ? <Info label="Dibayar" value={formatDateTime(order.paidAt)} /> : null}
        </Card>

        {confirmCancel && (
          <Notice message="Yakin ingin membatalkan pesanan ini? Stok produk akan dikembalikan.">
            <View style={styles.confirmRow}>
              <Button
                title="Tidak"
                variant="secondary"
                size="sm"
                onPress={() => setConfirmCancel(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Ya, Batalkan"
                size="sm"
                loading={action === 'cancel'}
                onPress={cancel}
                style={{ flex: 1, backgroundColor: colors.danger }}
              />
            </View>
          </Notice>
        )}
      </ScrollView>

      {pending && (
        <BottomBar>
          <View style={styles.actions}>
            <Button
              title="Batalkan"
              variant="danger"
              disabled={action !== null}
              onPress={() => setConfirmCancel(true)}
              style={{ flex: 1 }}
            />
            <Button
              title="Konfirmasi & Bayar"
              loading={action === 'pay'}
              loadingText="Memproses..."
              disabled={action !== null}
              onPress={pay}
              style={{ flex: 2 }}
            />
          </View>
        </BottomBar>
      )}
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  padded: { padding: 16 },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  info: { marginBottom: 12 },
  infoLabel: { fontSize: 12, color: colors.muted },
  infoValue: { fontSize: 14, color: colors.text, marginTop: 2, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 12 },
});
