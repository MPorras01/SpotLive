import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      router.replace('/(tabs)/map');
    }
  }, [currentUser]);

  async function onLogin() {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY para iniciar sesion.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });

    if (error || !data.user) {
      // Comentario de negocio: mostramos el error para que el usuario pueda corregir credenciales rapidamente.
      setErrorMessage(error?.message ?? 'No fue posible iniciar sesion.');
      setIsSubmitting(false);
      return;
    }

    setCurrentUser({ id: data.user.id, email: data.user.email ?? email, role: null });
    setIsSubmitting(false);
    router.replace('/(tabs)/profile');
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-semibold text-foreground">Iniciar sesion</Text>
      <Text className="mt-2 text-sm text-muted">Accede para sincronizar eventos y alertas.</Text>

      <View className="mt-6 gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="admin@spotlive.app"
          keyboardType="email-address"
          autoCapitalize="none"
          className="rounded-md border border-gray-300 px-3 py-2 text-foreground"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          className="rounded-md border border-gray-300 px-3 py-2 text-foreground"
        />

        {errorMessage ? <Text className="text-sm text-red-600">{errorMessage}</Text> : null}

        <Pressable
          onPress={() => {
            void onLogin();
          }}
          disabled={isSubmitting}
          className="h-11 items-center justify-center rounded-md bg-primary disabled:opacity-60"
        >
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text className="font-medium text-white">Entrar</Text>}
        </Pressable>
      </View>
    </View>
  );
}
