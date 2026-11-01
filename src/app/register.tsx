import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, Card, Notice, TextField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../lib/api';
import { colors } from '../theme';

// Halaman Register — tata letak sama dengan /register di web.
// Bedanya: setelah daftar langsung login (backend sudah mengembalikan token).
export default function RegisterScreen() {
  const { fromLogin } = useLocalSearchParams<{ fromLogin?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Nama, email, dan password wajib diisi');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.show('Akun berhasil dibuat. Selamat berbelanja!', { type: 'success' });
      // tutup halaman register (dan login, kalau datang dari sana)
      if (fromLogin === '1') router.dismiss(2);
      else if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mendaftar. Silakan coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.title}>Daftar Akun Baru</Text>

          {error ? <Notice message={error} /> : null}

          <View style={styles.form}>
            <TextField
              label="Nama Lengkap"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
              returnKeyType="next"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 6 karakter"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              rightIconLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              onPressRightIcon={() => setShowPassword((v) => !v)}
            />
            <Button
              title="Daftar"
              loading={loading}
              loadingText="Memproses..."
              onPress={handleSubmit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <Pressable
              hitSlop={8}
              onPress={() => (fromLogin === '1' ? router.back() : router.replace('/login'))}
            >
              <Text style={styles.link}>Masuk di sini</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingTop: 32 },
  card: { width: '100%', maxWidth: 448, alignSelf: 'center', padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: { gap: 16, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' },
  footerText: { fontSize: 14, color: colors.textBody },
  link: { fontSize: 14, fontWeight: '500', color: colors.primary },
});
