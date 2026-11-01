import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { colors } from '../theme';

// Preview web saja: matikan garis fokus hitam bawaan browser,
// supaya yang terlihat garis biru dari TextField (sama seperti di Android).
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'input:focus, textarea:focus { outline: none; }';
  document.head.appendChild(style);
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '600', fontSize: 17 },
                headerShadowVisible: false,
                headerTransparent: false,
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ title: 'Detail Produk' }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
              <Stack.Screen name="order/[id]" options={{ title: 'Detail Pesanan' }} />
              <Stack.Screen
                name="order-success"
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen name="login" options={{ title: 'Masuk' }} />
              <Stack.Screen name="register" options={{ title: 'Daftar' }} />
            </Stack>
            <StatusBar style="dark" />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
