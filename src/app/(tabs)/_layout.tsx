import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '../../components/ui';
import { useCart } from '../../context/CartContext';
import { colors } from '../../theme';

interface TabIconProps {
  color: ColorValue;
  focused: boolean;
  size: number;
}

function TabIcon({ icon, filled, color, focused, size }: TabIconProps & { icon: IconName; filled: IconName }) {
  return <Ionicons name={focused ? filled : icon} size={size} color={color as string} />;
}

export default function TabsLayout() {
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.white, fontSize: 10 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Katalog', tabBarIcon: (p: TabIconProps) => <TabIcon icon='storefront-outline' filled='storefront' {...p} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Keranjang',
          tabBarIcon: (p: TabIconProps) => <TabIcon icon='cart-outline' filled='cart' {...p} />,
          tabBarBadge: itemCount > 0 ? (itemCount > 99 ? '99+' : itemCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Pesanan', tabBarIcon: (p: TabIconProps) => <TabIcon icon='receipt-outline' filled='receipt' {...p} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Akun', tabBarIcon: (p: TabIconProps) => <TabIcon icon='person-outline' filled='person' {...p} /> }}
      />
    </Tabs>
  );
}
