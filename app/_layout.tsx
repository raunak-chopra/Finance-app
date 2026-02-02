import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Text, ActivityIndicator } from 'react-native';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db/client';
import migrations from '@/drizzle/migrations';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { useState, useEffect } from 'react';
import LockScreen from '@/components/LockScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { success, error } = useMigrations(db, migrations);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white dark:bg-black">
        <Text className="text-red-500 text-lg text-center mb-2">Migration Error</Text>
        <Text className="text-gray-500 text-center">{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-500">Updating Database...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LockScreen onUnlock={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* Helper screens for tools */}
        <Stack.Screen name="tools/fire-calculator" options={{ title: 'F.I.R.E. Calculator' }} />
        <Stack.Screen name="tools/net-worth" options={{ title: 'Net Worth' }} />
        <Stack.Screen name="tools/rental-yield" options={{ title: 'Rental Yield' }} />
        <Stack.Screen name="tools/add-asset" options={{ title: 'Add Asset', presentation: 'modal' }} />
        <Stack.Screen name="tools/add-liability" options={{ title: 'Add Liability', presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
