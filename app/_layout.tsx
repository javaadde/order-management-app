import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCafeFlowStore } from '../src/store/cafeFlow';

/**
 * Root Layout for Expo Router
 * Controls the navigation stack structure
 */
export default function RootLayout() {
  const { theme } = useCafeFlowStore();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Role Selection */}
        <Stack.Screen name="index" />

        {/* Servant Panel */}
        <Stack.Screen name="servant/index" />
        <Stack.Screen name="servant/menu" />
        <Stack.Screen name="servant/order-summary" />

        {/* Chef Panels */}
        <Stack.Screen name="chef/[role]" />

        {/* Admin Panel */}
        <Stack.Screen name="admin/index" />
      </Stack>
    </>
  );
}
