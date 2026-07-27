import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CounterProvider } from '@/contexts/CounterContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <SettingsProvider>
          <CounterProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </CounterProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
