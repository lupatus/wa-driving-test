import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StudyProvider } from '@/lib/store';

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StudyProvider>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="review"
                options={{ title: 'Review Missed', presentation: 'card' }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </StudyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
