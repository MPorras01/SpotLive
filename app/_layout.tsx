import { useEffect } from 'react';
import { Stack } from 'expo-router';
import '../global.css';

import { getMobileSessionProfile } from '../lib/queries';
import { useAuthStore } from '../stores/authStore';

export default function RootLayout() {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    async function bootstrapSession() {
      const session = await getMobileSessionProfile();

      if (!session) {
        setCurrentUser(null);
        setHydrated(true);
        return;
      }

      setCurrentUser({ id: session.id, email: session.email, role: session.role });
      setHydrated(true);
    }

    void bootstrapSession();
  }, [setCurrentUser, setHydrated]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
