import { AppNotification, NotificationTarget, useNotificationStore } from '../store/notifications';
import { Order, UserRole } from '../types';

type OutgoingNotification = {
  title: string;
  message: string;
  target?: NotificationTarget;
  important?: boolean;
};

type OrderListener = (order: Order) => void;
type OrderDeletedListener = (orderId: string) => void;

type SocketMessage = AppNotification | { type: 'order_created'; order: Order } | { type: 'order_deleted'; orderId: string };

const DEFAULT_WS_URL = 'ws://localhost:3001';

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let activeRole: UserRole | null = null;
const orderListeners = new Set<OrderListener>();
const orderDeletedListeners = new Set<OrderDeletedListener>();

function getWebSocketUrl() {
  if (process.env.EXPO_PUBLIC_WS_URL) return process.env.EXPO_PUBLIC_WS_URL;

  const location = (globalThis as { location?: { protocol?: string; hostname?: string } }).location;
  if (location?.hostname) {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${location.hostname}:3001`;
  }

  return DEFAULT_WS_URL;
}

function shouldShowNotification(notification: AppNotification) {
  const settings = useNotificationStore.getState().settings;
  if (!settings.enabled) return false;
  if (settings.importantOnly && !notification.important) return false;
  if (!notification.target || notification.target === 'all') return true;
  if (notification.target === 'chef') return activeRole?.startsWith('chef_') ?? false;
  return notification.target === activeRole;
}

function registerRole() {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'register', role: activeRole }));
  }
}

export function connectNotificationSocket(role: UserRole | null) {
  activeRole = role;

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    registerRole();
    return;
  }

  socket = new WebSocket(getWebSocketUrl());

  socket.onopen = () => {
    registerRole();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(String(event.data)) as SocketMessage;

      if (message.type === 'order_created' && message.order) {
        orderListeners.forEach((listener) => listener(message.order));
        return;
      }

      if (message.type === 'order_deleted' && message.orderId) {
        orderDeletedListeners.forEach((listener) => listener(message.orderId));
        return;
      }

      const notification = message as AppNotification;

      if (shouldShowNotification(notification)) {
        useNotificationStore.getState().addNotification(notification);
      }
    } catch {
      // Ignore invalid websocket payloads from external clients.
    }
  };

  socket.onclose = () => {
    socket = null;
    if (reconnectTimer) return;

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectNotificationSocket(activeRole);
    }, 1800);
  };
}

export function sendRealtimeNotification(notification: OutgoingNotification) {
  const payload = JSON.stringify({
    type: 'notification',
    ...notification,
  });

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(payload);
  }
}

export function sendRealtimeOrder(order: Order) {
  const payload = JSON.stringify({
    type: 'order_created',
    order,
  });

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(payload);
  }
}

export function subscribeToRealtimeOrders(listener: OrderListener) {
  orderListeners.add(listener);
  return () => orderListeners.delete(listener);
}

export function subscribeToDeletedRealtimeOrders(listener: OrderDeletedListener) {
  orderDeletedListeners.add(listener);
  return () => orderDeletedListeners.delete(listener);
}

export function getRealtimeBaseUrl() {
  const wsUrl = getWebSocketUrl();
  return wsUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
}
