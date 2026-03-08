import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '../../stores/authStore';

export default function AuthLayout() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return null;
  }

  if (currentUser) {
    return <Redirect href="/(tabs)/map" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
