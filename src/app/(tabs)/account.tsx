import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Navbar } from '../../components/Navbar';
import { Button, Card, PageTitle } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../lib/api';
import { colors, radius } from '../../theme';

// Tab Akun: profil + logout (di web tombol Logout ada di navbar).
export default function AccountScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.show('Kamu berhasil logout.');
  };

  return (
    <View style={styles.screen}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.content}>
        <PageTitle>Akun Saya</PageTitle>

        {user ? (
          <>
            <Card style={styles.profile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              {user.role === 'admin' && (
                <View style={styles.role}>
                  <Text style={styles.roleText}>ADMIN</Text>
                </View>
              )}
            </Card>

            <Card style={styles.menu}>
              <MenuRow
                icon="receipt-outline"
                label="Riwayat Pesanan"
                onPress={() => router.navigate('/orders')}
              />
              <MenuRow
                icon="cart-outline"
                label="Keranjang Belanja"
                onPress={() => router.navigate('/cart')}
              />
              <MenuRow
                icon="storefront-outline"
                label="Katalog Produk"
                onPress={() => router.navigate('/')}
                last
              />
            </Card>

            <Button title="Logout" variant="danger" icon="log-out-outline" onPress={handleLogout} />
          </>
        ) : (
          <Card style={styles.guest}>
            <Ionicons name="person-circle-outline" size={56} color={colors.borderStrong} />
            <Text style={styles.guestTitle}>Masuk ke akun kamu</Text>
            <Text style={styles.guestText}>
              Login untuk menyimpan keranjang, checkout, dan melihat riwayat pesanan.
            </Text>
            <Button title="Masuk" onPress={() => router.push('/login')} style={styles.guestBtn} />
            <Button
              title="Daftar Akun Baru"
              variant="secondary"
              onPress={() => router.push('/register')}
              style={styles.guestBtn}
            />
          </Card>
        )}

        <Text style={styles.footer}>Toko Online v1.0.0 · {API_URL}</Text>
      </ScrollView>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  last = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuRowBorder,
        pressed && { backgroundColor: colors.bg },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.textBody} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.primary },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  role: {
    backgroundColor: colors.infoSoft,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.info },
  menu: { padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  guest: { alignItems: 'center', paddingVertical: 28 },
  guestTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 8 },
  guestText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 16,
  },
  guestBtn: { alignSelf: 'stretch', marginTop: 8 },
  footer: { fontSize: 11, color: colors.faint, textAlign: 'center' },
});
