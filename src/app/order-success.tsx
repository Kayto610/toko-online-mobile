import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MONO_FONT } from '../components/OrderCard';
import { Button, Card, StatusBadge } from '../components/ui';
import { api } from '../lib/api';
import { PAYMENT_LABEL, formatDateTime, formatRupiah } from '../lib/format';
import type { ApiResponse, Order } from '../lib/types';
import { colors } from '../theme';

// Langkah terakhir user flow: "Pembayaran Sukses & Notifikasi Pesanan Berhasil".
export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<ApiResponse<Order>>(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => undefined);
  }, [id]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={48} color={colors.successIcon} />
      </View>
      <Text style={styles.title}>Pembayaran Berhasil!</Text>
      <Text style={styles.subtitle}>
        Pesanan kamu berhasil dibuat dan pembayarannya sudah kami terima.
      </Text>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>ID Pesanan</Text>
          <Text style={styles.mono} numberOfLines={1}>
            #{id}
          </Text>
        </View>
        {order && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Tanggal</Text>
              <Text style={styles.value}>{formatDateTime(order.paidAt ?? order.createdAt)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Metode Pembayaran</Text>
              <Text style={styles.value}>{PAYMENT_LABEL[order.paymentMethod]}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <StatusBadge status={order.status} />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.total}>{formatRupiah(order.totalPrice)}</Text>
            </View>
          </>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Lihat Detail Pesanan"
          onPress={() => router.replace({ pathname: '/order/[id]', params: { id } })}
        />
        <Button title="Kembali Belanja" variant="secondary" onPress={() => router.dismissTo('/')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, alignItems: 'center' },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 20 },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 320,
  },
  card: { width: '100%', maxWidth: 480, marginTop: 24, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  label: { fontSize: 13, color: colors.muted },
  value: { fontSize: 13, fontWeight: '500', color: colors.text, flexShrink: 1, textAlign: 'right' },
  mono: { fontFamily: MONO_FONT, fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.surface, marginVertical: 2 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.textBody },
  total: { fontSize: 18, fontWeight: '700', color: colors.primary },
  actions: { width: '100%', maxWidth: 480, gap: 10, marginTop: 24 },
});
