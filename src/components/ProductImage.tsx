import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, radius } from '../theme';

// Kotak foto abu-abu dengan tulisan "FOTO PRODUK" seperti di web;
// foto ditimpa di atasnya, dan kalau gagal dimuat placeholder tetap terlihat.
export function ProductImage({
  uri,
  style,
  showLabel = true,
}: {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const hasImage = !!uri && !failed;

  return (
    <View style={[styles.box, style]}>
      {showLabel && !hasImage && <Text style={styles.label}>Foto Produk</Text>}
      {hasImage && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.faint,
  },
});
