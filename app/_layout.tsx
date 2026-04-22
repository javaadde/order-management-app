import { Stack } from 'expo-router';

/**
 * Root Layout for Expo Router
 * Controls the navigation stack structure
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Role Selection */}
      <Stack.Screen name="index" />

      {/* Servant Panel */}
      <Stack.Screen name="servant" />
      <Stack.Screen name="servant/menu" />
      <Stack.Screen name="servant/order-summary" />

      {/* Chef Panels */}
      <Stack.Screen name="chef/[role]" />
    </Stack>
  );
}
