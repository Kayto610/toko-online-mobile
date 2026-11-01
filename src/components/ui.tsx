// Komponen dasar yang meniru kelas Tailwind di toko-online-web
// (bg-blue-600 rounded-lg, kartu bg-white border-gray-200 rounded-xl shadow-sm, dst).
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { OrderStatus } from '../lib/types';
import { colors, radius, shadow } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ----------------------------------------------------------------------------
 * Button
 * ------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const buttonColors: Record<
  ButtonVariant,
  { bg: string; pressed: string; text: string; border?: string }
> = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, text: colors.white },
  secondary: { bg: colors.surface, pressed: colors.surfacePressed, text: colors.textSecondary },
  outline: {
    bg: colors.white,
    pressed: colors.primarySoft,
    text: colors.primary,
    border: colors.primary,
  },
  danger: { bg: colors.dangerSoft, pressed: colors.dangerSoftPressed, text: colors.danger },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  disabled = false,
  icon,
  style,
  testID,
}: ButtonProps) {
  const c = buttonColors[variant];
  const isDisabled = disabled || loading;
  const fontSize = size === 'sm' ? 13 : 15;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' ? styles.buttonSm : styles.buttonMd,
        { backgroundColor: pressed ? c.pressed : c.bg },
        c.border ? { borderWidth: 1, borderColor: c.border } : null,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={c.text} />
      ) : icon ? (
        <Ionicons name={icon} size={fontSize + 3} color={c.text} />
      ) : null}
      <Text style={[styles.buttonText, { color: c.text, fontSize }]} numberOfLines={1}>
        {loading && loadingText ? loadingText : title}
      </Text>
    </Pressable>
  );
}

/* ----------------------------------------------------------------------------
 * TextField
 * ------------------------------------------------------------------------- */

interface TextFieldProps extends TextInputProps {
  label: string;
  rightIcon?: IconName;
  rightIconLabel?: string;
  onPressRightIcon?: () => void;
}

export function TextField({
  label,
  style,
  multiline,
  onFocus,
  onBlur,
  rightIcon,
  rightIconLabel,
  onPressRightIcon,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          {...rest}
          multiline={multiline}
          placeholderTextColor={colors.faint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            focused && styles.inputFocused,
            rightIcon ? { paddingRight: 44 } : null,
            style,
          ]}
        />
        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightIconLabel}
            hitSlop={8}
            onPress={onPressRightIcon}
            style={styles.inputIcon}
          >
            <Ionicons name={rightIcon} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* ----------------------------------------------------------------------------
 * Layout helpers
 * ------------------------------------------------------------------------- */

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.pageTitle}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/** Kotak pesan merah seperti `bg-red-50 text-red-600 border-red-200` di web. */
export function Notice({
  message,
  bordered = false,
  children,
}: {
  message: string;
  bordered?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={[styles.notice, bordered && styles.noticeBordered]}>
      <Text style={[styles.noticeText, bordered && { textAlign: 'center' }]}>{message}</Text>
      {children}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.card, styles.empty]}>
      {icon && <Ionicons name={icon} size={44} color={colors.borderStrong} />}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: 16 }} />
      ) : null}
    </View>
  );
}

export function LoadingState({ text }: { text: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

/** Bar aksi menempel di bawah layar (Checkout, Beli Sekarang, dst). */
export function BottomBar({ children, inTabs = false }: { children: ReactNode; inTabs?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomBar, { paddingBottom: (inTabs ? 0 : insets.bottom) + 12 }]}>
      {children}
    </View>
  );
}

/* ----------------------------------------------------------------------------
 * Controls
 * ------------------------------------------------------------------------- */

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const canDec = !disabled && value > min;
  const canInc = !disabled && (max === undefined || value < max);
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel="Kurangi jumlah"
        disabled={!canDec}
        onPress={() => onChange(value - 1)}
        style={({ pressed }) => [
          styles.stepBtn,
          pressed && { backgroundColor: colors.surfacePressed },
          !canDec && styles.disabled,
        ]}
      >
        <Text style={styles.stepBtnText}>-</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable
        accessibilityLabel="Tambah jumlah"
        disabled={!canInc}
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => [
          styles.stepBtn,
          pressed && { backgroundColor: colors.surfacePressed },
          !canInc && styles.disabled,
        ]}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      hitSlop={10}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={[styles.checkbox, checked && styles.checkboxChecked, disabled && styles.disabled]}
    >
      {checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
    </Pressable>
  );
}

export function RadioOption({
  label,
  description,
  icon,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.radio, selected && styles.radioSelected]}
    >
      <Ionicons name={icon} size={20} color={selected ? colors.primary : colors.textBody} />
      <View style={{ flex: 1 }}>
        <Text style={styles.radioLabel}>{label}</Text>
        {description ? <Text style={styles.radioDesc}>{description}</Text> : null}
      </View>
      <View style={[styles.radioCircle, selected && { borderColor: colors.primary }]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

/* ----------------------------------------------------------------------------
 * Status badge (warna sama dengan getStatusBadge() di web)
 * ------------------------------------------------------------------------- */

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  completed: { bg: colors.successSoft, text: colors.success },
  paid: { bg: colors.successSoft, text: colors.success },
  pending: { bg: colors.warningSoft, text: colors.warning },
  cancelled: { bg: '#fee2e2', text: '#b91c1c' },
};

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  const s = STATUS_STYLE[status?.toLowerCase()] ?? { bg: colors.infoSoft, text: colors.info };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{(status || 'pending').toUpperCase()}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
  },
  buttonMd: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10 },
  buttonSm: { minHeight: 36, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { fontWeight: '500' },
  disabled: { opacity: 0.5 },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.focus,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
    ...shadow.sm,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },

  notice: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    padding: 12,
  },
  noticeBordered: {
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
  },
  noticeText: { color: colors.danger, fontSize: 14, lineHeight: 20 },

  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyTitle: {
    color: colors.textBody,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: { color: colors.faint, fontSize: 13, textAlign: 'center', marginTop: 4 },

  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 },
  loadingText: { color: colors.muted, fontWeight: '500', fontSize: 14 },

  bottomBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 17, fontWeight: '700', color: colors.textSecondary, lineHeight: 20 },
  stepValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },

  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    backgroundColor: colors.white,
  },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radioLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  radioDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
});
