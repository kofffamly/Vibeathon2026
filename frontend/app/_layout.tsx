import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { session, init } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => { init(); }, []);

  useEffect(() => {
    const inAuth = segments[0] === 'auth' || segments[0] === 'splash';
    if (!session && !inAuth) router.replace('/splash');
    if (session && inAuth) router.replace('/(tabs)');
  }, [session, segments]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="ai-assistant" />
      </Stack>
    </SafeAreaProvider>
  );
}
