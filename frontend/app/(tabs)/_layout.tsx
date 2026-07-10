import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/cartStore';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[s.tabLabel, focused && s.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const totalItems = useCartStore(st => st.totalItems());
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [s.tabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }],
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2d6a4f',
      }}
    >
      {/* Marché */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏪" label="Marché" focused={focused} />,
        }}
      />

      {/* Panier — tab qui ouvre cart.tsx via navigation */}
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity
              style={{ alignItems: 'center', paddingTop: 4 }}
              onPress={() => router.push('/cart')}
              activeOpacity={0.7}
            >
              <View style={{ position: 'relative' }}>
                <Text style={{ fontSize: 20 }}>🛒</Text>
                {totalItems > 0 && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                  </View>
                )}
              </View>
              <Text style={[s.tabLabel, focused && s.tabLabelActive]}>Panier</Text>
            </TouchableOpacity>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              onPress={() => router.push('/cart')}
              style={props.style}
            />
          ),
        }}
      />

      {/* Bouton publier central */}
      <Tabs.Screen
        name="publish"
        options={{
          tabBarIcon: () => (
            <View style={s.publishBtn}>
              <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' }}>+</Text>
            </View>
          ),
        }}
      />

      {/* Commandes */}
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Commandes" focused={focused} />,
        }}
      />

      {/* Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e0d0',
  },
  tabLabel: { fontSize: 10, color: '#aaa', marginTop: 2 },
  tabLabelActive: { color: '#2d6a4f', fontWeight: '700' },
  publishBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#2d6a4f',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2d6a4f', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  badge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#e53e3e',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
