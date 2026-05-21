import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotificationStore } from '../store/notifications';
import { playNotificationSound } from '../utils/notificationSound';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';

export function NotificationToasts() {
  const notifications = useNotificationStore((state) => state.notifications);
  const settings = useNotificationStore((state) => state.settings);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const latest = notifications.find(
    (notification) =>
      !notification.read &&
      settings.enabled &&
      settings.floating &&
      (!settings.importantOnly || notification.important)
  );

  useEffect(() => {
    if (!latest) return;

    if (settings.soundEnabled) {
      playNotificationSound(settings.sound);
    }

    const timer = setTimeout(() => {
      dismissNotification(latest.id);
    }, 3800);

    return () => clearTimeout(timer);
  }, [dismissNotification, latest, settings.sound, settings.soundEnabled]);

  if (!latest) return null;

  return (
    <View pointerEvents="box-none" style={styles.toastWrap}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => dismissNotification(latest.id)} style={styles.toast}>
        <Text style={styles.toastTitle}>{latest.title}</Text>
        <Text style={styles.toastMessage}>{latest.message}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toast: {
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: INK,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  toastTitle: {
    color: TEA_BROWN,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  toastMessage: {
    marginTop: 3,
    color: INK,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.72,
  },
});
