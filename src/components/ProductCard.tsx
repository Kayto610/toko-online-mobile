import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRupiah } from '../lib/format';
import type { Product } from '../lib/types';
import { colors, radius, shadow } from '../theme';
import { ProductImage } from './ProductImage';
import { Button } from './ui';

// Kartu produk katalog — versi 2 kolom dari kartu di halaman utama web.
export function ProductCard({
  product,
  adding,
  onPress,
  onAddToCart,
}: {
  product: Product;
  adding: boolean;
  onPress: () => void;
  onAddToCart: () => void;
}) {
  const soldOut = product.stock <= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && shadow.md]}
      accessibilityRole="button"
      accessibilityLabel={`Lihat detail ${product.name}`}
    >
      <View style={styles.body}>
        <ProductImage uri={product.imageUrl} style={styles.image} />
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatRupiah(product.price)}</Text>
        <View style={styles.stock}>
          <Text style={styles.stockText}>Stok: {product.stock}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          size="sm"
          title={soldOut ? 'Stok Habis' : '+ Keranjang'}
          loading={adding}
          loadingText="Menambahkan..."
          disabled={soldOut}
          onPress={onAddToCart}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...shadow.sm,
  },
  body: { padding: 12 },
  image: { height: 128, marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  desc: { fontSize: 12.5, lineHeight: 17, color: colors.muted, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 8 },
  stock: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  stockText: { fontSize: 11, fontWeight: '500', color: colors.muted },
  footer: { paddingHorizontal: 12, paddingBottom: 12 },
});
