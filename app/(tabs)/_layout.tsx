import { Redirect, Tabs } from 'expo-router';

import { useAuthStore } from '../../stores/authStore';

export default function TabsLayout() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAdmin = currentUser?.role === 'admin';

  if (!isHydrated) {
    return null;
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="map" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="events" options={{ title: 'Eventos' }} />
      {isAdmin ? <Tabs.Screen name="admin" options={{ title: 'Admin' }} /> : null}
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
