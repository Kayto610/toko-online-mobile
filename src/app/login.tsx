import { useRouter } from 'expo-router';
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

// Halaman Login — tata letak sama dengan /login di web.
export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.show('Login berhasil. Selamat berbelanja!', { type: 'success' });
      // kembali ke halaman sebelumnya (mis. detail produk yang tadi dibuka)
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal login. Periksa email dan password kamu.'));
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
          <Text style={styles.logo}>
            Toko<Text style={{ color: colors.text }}>Online</Text>
          </Text>
          <Text style={styles.title}>Masuk ke Akun</Text>

          {error ? <Notice message={error} /> : null}

          <View style={styles.form}>
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
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              rightIconLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              onPressRightIcon={() => setShowPassword((v) => !v)}
            />
            <Button
              title="Masuk"
              loading={loading}
              loadingText="Proses Login..."
              onPress={handleSubmit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push({ pathname: '/register', params: { fromLogin: '1' } })}
            >
              <Text style={styles.link}>Daftar sekarang</Text>
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
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
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
