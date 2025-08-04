import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';
import { useAuthStore } from '../store/authStore';
import { router, usePathname } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if user is not authenticated and trying to access protected routes
    if (!isAuthenticated && pathname.startsWith('/(tabs)')) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, pathname]);

  return (
    <QueryProvider>
      <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      </ToastProvider>
    </QueryProvider>
  );
}