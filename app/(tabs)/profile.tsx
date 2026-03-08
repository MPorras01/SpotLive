import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);

  async function onSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setCurrentUser(null);
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="rounded-lg border border-gray-200 bg-white p-5">
        <Text className="text-lg font-semibold text-foreground">Perfil</Text>
        <Text className="mt-3 text-sm text-muted">Email: {currentUser?.email ?? 'No autenticado'}</Text>
        <Text className="mt-1 text-sm text-muted">ID: {currentUser?.id ?? 'Sin sesion activa'}</Text>
        <Text className="mt-1 text-sm text-muted">Rol: {currentUser?.role ?? 'Sin rol'}</Text>

        {!currentUser ? (
          <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-5 h-11 items-center justify-center rounded-md bg-primary">
            <Text className="font-medium text-white">Iniciar sesion</Text>
          </Pressable>
        ) : null}

        {currentUser?.role === 'admin' ? (
          <Pressable onPress={() => router.push('/(tabs)/admin')} className="mt-3 h-11 items-center justify-center rounded-md border border-primary bg-white">
            <Text className="font-medium text-primary">Panel admin</Text>
          </Pressable>
        ) : null}

        {currentUser ? (
          <Pressable onPress={() => void onSignOut()} className="mt-5 h-11 items-center justify-center rounded-md bg-gray-900">
            <Text className="font-medium text-white">Cerrar sesion</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
