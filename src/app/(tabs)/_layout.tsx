import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  const c = useTheme();

  const icon =
    (name: IoniconName, focusedName: IoniconName) =>
    ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
      <Ionicons name={focused ? focusedName : name} size={size} color={color as string} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        sceneStyle: { backgroundColor: c.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: icon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="study"
        options={{ title: 'Study', tabBarIcon: icon('book-outline', 'book') }}
      />
      <Tabs.Screen
        name="test"
        options={{ title: 'Test', tabBarIcon: icon('create-outline', 'create') }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{ title: 'Cards', tabBarIcon: icon('albums-outline', 'albums') }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: icon('stats-chart-outline', 'stats-chart') }}
      />
    </Tabs>
  );
}
