import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NotificationSound, useNotificationStore } from '../src/store/notifications';
import { playNotificationSound } from '../src/utils/notificationSound';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const ORANGE = '#F26B2A';

const SOUNDS: Array<{ id: NotificationSound; label: string; description: string }> = [
  { id: 'tea-bell', label: 'Tea bell', description: 'Bright counter bell for new activity' },
  { id: 'kitchen-tap', label: 'Kitchen tap', description: 'Short wooden prep tap' },
  { id: 'soft-chime', label: 'Soft chime', description: 'Gentle notification chime' },
  { id: 'silent', label: 'Silent', description: 'No sound, visual only' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useNotificationStore((state) => state.settings);
  const updateSettings = useNotificationStore((state) => state.updateSettings);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>App Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <SettingSwitch
              label="Turn on notifications"
              description="Receive realtime order updates across panels."
              value={settings.enabled}
              onValueChange={(enabled) => updateSettings({ enabled })}
            />
            <SettingSwitch
              label="Important notifications only"
              description="Show only critical updates like ready orders and billing."
              value={settings.importantOnly}
              onValueChange={(importantOnly) => updateSettings({ importantOnly })}
            />
            <SettingSwitch
              label="Floating notifications"
              description="Show paper-style toast alerts over the app."
              value={settings.floating}
              onValueChange={(floating) => updateSettings({ floating })}
            />
            <SettingSwitch
              label="Vibration"
              description="Allow haptic feedback for important updates."
              value={settings.vibrationEnabled}
              onValueChange={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
            />
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Sound</Text>
            <SettingSwitch
              label="Notification sounds"
              description="Enable or mute notification sounds."
              value={settings.soundEnabled}
              onValueChange={(soundEnabled) => updateSettings({ soundEnabled })}
            />
            {SOUNDS.map((sound) => {
              const active = settings.sound === sound.id;
              const canPreview = settings.soundEnabled && sound.id !== 'silent';
              return (
                <TouchableOpacity
                  key={sound.id}
                  activeOpacity={0.76}
                  onPress={() => updateSettings({ sound: sound.id })}
                  style={[styles.soundRow, active && styles.activeSoundRow]}
                >
                  <View style={styles.soundTextWrap}>
                    <Text style={[styles.soundLabel, active && styles.activeSoundText]}>{sound.label}</Text>
                    <Text style={[styles.soundDescription, active && styles.activeSoundDescription]}>{sound.description}</Text>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Preview ${sound.label}`}
                    activeOpacity={0.76}
                    disabled={!canPreview}
                    onPress={() => playNotificationSound(sound.id)}
                    style={[styles.playIconButton, !canPreview && styles.disabledPlayIconButton]}
                  >
                    <Text style={[styles.playIcon, active && styles.activeSoundText]}>▶</Text>
                  </TouchableOpacity>
                  <Text style={[styles.soundCheck, active && styles.activeSoundText]}>{active ? '✓' : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={clearNotifications} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear notification history</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SettingSwitch({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D7C5A5', true: TEA_BROWN }}
        thumbColor={value ? ORANGE : PAPER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAPER },
  frame: { flex: 1, borderWidth: 1.4, borderColor: INK, backgroundColor: PAPER },
  header: { height: 68, borderBottomWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 54, borderRightWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  backText: { color: INK, fontSize: 32, lineHeight: 34 },
  title: { color: INK, fontSize: 18, fontWeight: '900', letterSpacing: 1.2 },
  content: { padding: 18, paddingBottom: 36 },
  sectionBox: { borderWidth: 1.2, borderColor: INK, padding: 14, marginBottom: 18, backgroundColor: PAPER },
  sectionTitle: { color: INK, fontSize: 17, fontWeight: '900', letterSpacing: 0.8, marginBottom: 6 },
  settingRow: { minHeight: 70, borderTopWidth: 1, borderColor: 'rgba(23, 18, 13, 0.28)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  settingCopy: { flex: 1, paddingRight: 12 },
  settingLabel: { color: INK, fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  settingDescription: { marginTop: 3, color: INK, opacity: 0.56, fontSize: 10, fontWeight: '800', lineHeight: 14 },
  soundRow: { minHeight: 64, borderTopWidth: 1, borderColor: 'rgba(23, 18, 13, 0.28)', flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  activeSoundRow: { backgroundColor: TEA_BROWN, marginHorizontal: -8, paddingHorizontal: 8, borderColor: INK },
  soundTextWrap: { flex: 1, paddingRight: 12 },
  soundLabel: { color: INK, fontSize: 13, fontWeight: '900' },
  soundDescription: { marginTop: 3, color: INK, opacity: 0.56, fontSize: 10, fontWeight: '800' },
  activeSoundText: { color: PAPER },
  activeSoundDescription: { color: 'rgba(247, 233, 207, 0.72)', opacity: 1 },
  soundCheck: { width: 22, color: INK, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  playIconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  disabledPlayIconButton: { opacity: 0.28 },
  playIcon: { color: INK, fontSize: 14, fontWeight: '900' },
  clearButton: { minHeight: 50, borderWidth: 1.2, borderColor: INK, backgroundColor: TEA_BROWN, alignItems: 'center', justifyContent: 'center' },
  clearButtonText: { color: PAPER, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
});
