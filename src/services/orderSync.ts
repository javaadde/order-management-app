import { Order } from '../types';
import { getRealtimeBaseUrl } from './notificationSocket';

export async function fetchDailyOrders() {
  const response = await fetch(`${getRealtimeBaseUrl()}/orders`);
  if (!response.ok) throw new Error('Failed to fetch daily orders');

  const data = (await response.json()) as { orders?: Order[] };
  return data.orders ?? [];
}

export async function publishOrder(order: Order) {
  await fetch(`${getRealtimeBaseUrl()}/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(order),
  });
}

export async function deleteCloudOrder(orderId: string) {
  await fetch(`${getRealtimeBaseUrl()}/orders/${orderId}`, {
    method: 'DELETE',
  });
}
