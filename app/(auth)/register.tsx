import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function onRegister() {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY para crear cuenta.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    // Comentario de negocio: tras registro exitoso redirigimos a login para continuar autenticacion.
    setMessage('Cuenta creada. Revisa tu correo para confirmar acceso.');
    setIsSubmitting(false);
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="text-2xl font-semibold text-foreground">Crear cuenta</Text>
      <Text className="mt-2 text-sm text-muted">Registra tu usuario para usar SpotLive.</Text>

      <View className="mt-6 gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="tu-correo@spotlive.app"
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

        {message ? <Text className="text-sm text-muted">{message}</Text> : null}

        <Pressable
          onPress={() => {
            void onRegister();
          }}
          disabled={isSubmitting}
          className="h-11 items-center justify-center rounded-md bg-primary disabled:opacity-60"
        >
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text className="font-medium text-white">Registrarme</Text>}
        </Pressable>
      </View>
    </View>
  );
}
