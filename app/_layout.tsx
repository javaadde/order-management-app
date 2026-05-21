import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { NotificationToasts } from '../src/components/NotificationToasts';
import { connectNotificationSocket, subscribeToDeletedRealtimeOrders, subscribeToRealtimeOrders } from '../src/services/notificationSocket';
import { fetchDailyOrders } from '../src/services/orderSync';
import { useCafeFlowStore } from '../src/store/cafeFlow';

/**
 * Root Layout for Expo Router
 * Controls the navigation stack structure
 */
export default function RootLayout() {
  const { currentRole, theme, setOrders, upsertOrder, removeSyncedOrder } = useCafeFlowStore();

  useEffect(() => {
    connectNotificationSocket(currentRole);
  }, [currentRole]);

  useEffect(() => {
    let active = true;

    fetchDailyOrders()
      .then((orders) => {
        if (active) setOrders(orders);
      })
      .catch(() => {
        // The app still works locally if the daily order server is offline.
      });

    const unsubscribeOrders = subscribeToRealtimeOrders(upsertOrder);
    const unsubscribeDeletedOrders = subscribeToDeletedRealtimeOrders(removeSyncedOrder);

    return () => {
      active = false;
      unsubscribeOrders();
      unsubscribeDeletedOrders();
    };
  }, [removeSyncedOrder, setOrders, upsertOrder]);

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
        <Stack.Screen name="settings" />

        {/* Servant Panel */}
        <Stack.Screen name="servant/index" />
        <Stack.Screen name="servant/bill" />
        <Stack.Screen name="servant/profile" />
        <Stack.Screen name="servant/menu" />
        <Stack.Screen name="servant/order-summary" />

        {/* Chef Panels */}
        <Stack.Screen name="chef/[role]" />
        <Stack.Screen name="chef/profile" />
        <Stack.Screen name="chef/tea-maker-profile" />

        {/* Admin Panel */}
        <Stack.Screen name="admin/index" />
      </Stack>
      <NotificationToasts />
    </>
  );
}
