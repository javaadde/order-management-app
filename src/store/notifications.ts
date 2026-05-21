import { create } from 'zustand';
import { UserRole } from '../types';

export type NotificationTarget = UserRole | 'chef' | 'all';

export interface AppNotification {
  id: string;
  type: 'notification' | 'connected' | 'error';
  title: string;
  message: string;
  target?: NotificationTarget;
  important?: boolean;
  createdAt: number;
  read: boolean;
}

export type NotificationSound = 'tea-bell' | 'kitchen-tap' | 'soft-chime' | 'silent';

export interface NotificationSettings {
  enabled: boolean;
  importantOnly: boolean;
  floating: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  sound: NotificationSound;
}

interface NotificationStore {
  notifications: AppNotification[];
  settings: NotificationSettings;
  addNotification: (notification: Omit<AppNotification, 'read'>) => void;
  dismissNotification: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  settings: {
    enabled: true,
    importantOnly: false,
    floating: true,
    soundEnabled: true,
    vibrationEnabled: true,
    sound: 'tea-bell',
  },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [{ ...notification, read: false }, ...state.notifications].slice(0, 30),
    }));
  },
  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  },
  clearNotifications: () => {
    set({ notifications: [] });
  },
  updateSettings: (settings) => {
    set((state) => ({ settings: { ...state.settings, ...settings } }));
  },
}));
