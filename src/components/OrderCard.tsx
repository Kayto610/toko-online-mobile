import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDate, formatRupiah } from '../lib/format';
import type { Order } from '../lib/types';
import { colors, radius, shadow } from '../theme';
import { StatusBadge } from './ui';

export const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });

// Kartu riwayat pesanan — tata letak sama dengan halaman /orders di web.
export function OrderCard({ order, onPress }: { order: Order; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && shadow.md]}
    >
      <View style={styles.header}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.idLabel}>ID Pesanan</Text>
          <Text style={styles.id} numberOfLines={1}>
            #{order._id}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          <StatusBadge status={order.status} />
        </View>
      </View>

      <View style={styles.items}>
        {order.items?.map((item, idx) => (
          <View key={`${item.product}-${idx}`} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name || 'Produk'}
              </Text>
              <Text style={styles.itemQty}>
                {item.quantity} x {formatRupiah(item.price)}
              </Text>
            </View>
            <Text style={styles.itemSubtotal}>{formatRupiah(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total Pembayaran</Text>
        <View style={styles.totalRight}>
          <Text style={styles.total}>{formatRupiah(order.totalPrice)}</Text>
          {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.faint} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  idLabel: { fontSize: 11, color: colors.faint },
  id: { fontFamily: MONO_FONT, fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  date: { fontSize: 12, color: colors.muted },
  items: { paddingVertical: 12, gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemName: { fontSize: 14, fontWeight: '500', color: colors.text },
  itemQty: { fontSize: 12, color: colors.muted, marginTop: 1 },
  itemSubtotal: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, fontWeight: '500', color: colors.textBody },
  totalRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  total: { fontSize: 18, fontWeight: '700', color: colors.primary },
});
