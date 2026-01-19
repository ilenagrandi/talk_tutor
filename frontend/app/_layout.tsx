import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export default function RootLayout() {
  const { initializeLanguage } = useStore();

  useEffect(() => {
    initializeLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="results" />
          <Stack.Screen name="subscription" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
