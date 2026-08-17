import { Redirect, Slot, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  usePushNotifications();

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthGate />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function AuthGate() {
  const { isAuthenticated, role } = useAuthStore();
  const segments = useSegments();

  const inAuthGroup = segments[0] === 'auth';

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/auth" />;
  }

  if (isAuthenticated) {
    if (role === 'supplier' && segments[0] !== 'supplier') {
      return <Redirect href="/supplier" />;
    }
    if (role === 'store_owner' && segments[0] !== 'store-owner') {
      return <Redirect href="/store-owner" />;
    }
  }

  return <Slot />;
}
