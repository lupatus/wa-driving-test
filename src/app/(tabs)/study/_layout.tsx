import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function StudyLayout() {
  const c = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Study by Topic' }} />
      <Stack.Screen name="[topic]" options={{ title: 'Study' }} />
    </Stack>
  );
}
