import Ionicons from '@expo/vector-icons/Ionicons';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow } from '../theme';

type ToastType = 'default' | 'success' | 'error';

interface ToastOptions {
  type?: ToastType;
  action?: { label: string; onPress: () => void };
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Pengganti alert() di web: notifikasi kecil di atas layar, bekerja di Android & web.
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [opacity]);

  const show = useCallback(
    (message: string, options: ToastOptions = {}) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), message, ...options });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, options.duration ?? (options.action ? 4000 : 2500));
    },
    [hide, opacity],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show }), [show]);

  const icon =
    toast?.type === 'success'
      ? { name: 'checkmark-circle' as const, color: '#4ade80' }
      : toast?.type === 'error'
        ? { name: 'alert-circle' as const, color: '#f87171' }
        : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        // di atas (tepat di bawah header) supaya tidak menutupi tombol Checkout/Bayar di bawah
        <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 64 }]}>
          <Animated.View testID="toast" style={[styles.toast, { opacity }]}>
            {icon && <Ionicons name={icon.name} size={20} color={icon.color} />}
            <Text style={styles.message}>{toast.message}</Text>
            {toast.action && (
              <Pressable
                hitSlop={8}
                onPress={() => {
                  toast.action?.onPress();
                  hide();
                }}
              >
                <Text style={styles.action}>{toast.action.label}</Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.toast,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 480,
    width: '100%',
    ...shadow.md,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  action: {
    color: '#93c5fd', // blue-300
    fontSize: 14,
    fontWeight: '700',
  },
});
