import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { Button } from './ui';

// Header putih dengan logo "TokoOnline" — sama seperti <Navbar /> di web.
// Menu navigasi web (Katalog/Keranjang/Pesanan) dipindah ke tab bar bawah.
export function Navbar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Text style={styles.logo} accessibilityRole="header">
          Toko<Text style={styles.logoDark}>Online</Text>
        </Text>
        {user ? (
          <Text style={styles.greeting} numberOfLines={1}>
            Halo, <Text style={styles.greetingName}>{user.name}</Text>
          </Text>
        ) : (
          <Button title="Login" size="sm" onPress={() => router.push('/login')} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logo: { fontSize: 20, fontWeight: '700', color: colors.primary },
  logoDark: { color: colors.text },
  greeting: { flexShrink: 1, fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  greetingName: { fontWeight: '700', color: colors.text },
});
