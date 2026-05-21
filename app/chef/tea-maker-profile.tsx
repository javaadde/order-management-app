import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MENU_ITEMS } from '../../src/constants/menu';
import { useCafeFlowStore } from '../../src/store/cafeFlow';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const ORANGE = '#F26B2A';
const INK = '#17120D';

type ProfileView = 'options' | 'dashboard';

const fallbackTeaBars = [22, 16, 28, 19, 34];

function getTodayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export default function TeaMakerProfile() {
  const router = useRouter();
  const { allOrders, setRole } = useCafeFlowStore();
  const [profileView, setProfileView] = useState<ProfileView>('options');

  const teaStats = useMemo(() => {
    const todayStart = getTodayStart();
    const teaItems = MENU_ITEMS.filter((item) => item.chef === 'chef_a');
    const totals = new Map<string, { name: string; quantity: number }>();

    teaItems.forEach((item) => totals.set(item.id, { name: item.name, quantity: 0 }));

    allOrders.forEach((order) => {
      if (order.createdAt < todayStart) return;

      order.items.forEach((item) => {
        if (item.assignedChef !== 'chef_a') return;

        const current = totals.get(item.menuItemId) ?? { name: item.menuItemName, quantity: 0 };
        totals.set(item.menuItemId, { ...current, quantity: current.quantity + item.quantity });
      });
    });

    const sortedTeas = Array.from(totals.values()).sort((a, b) => b.quantity - a.quantity);
    const totalTea = sortedTeas.reduce((total, item) => total + item.quantity, 0);
    const topTea = sortedTeas.find((item) => item.quantity > 0)?.name ?? 'No tea sold yet';
    const specialTea = sortedTeas.find((item) => item.name.toLowerCase().includes('healthy')) ?? sortedTeas[1];

    return {
      totalTea,
      topTea,
      specialTeaName: specialTea?.name ?? 'No special tea yet',
      specialTeaQuantity: specialTea?.quantity ?? 0,
      teaBars: sortedTeas.map((item) => item.quantity).some(Boolean) ? sortedTeas.slice(0, 5) : fallbackTeaBars.map((quantity, index) => ({ name: ['Black', 'Milk', 'Healthy', 'Masala', 'Mint'][index], quantity })),
    };
  }, [allOrders]);

  const maxTeaValue = Math.max(...teaStats.teaBars.map((item) => item.quantity), 1);

  const handleLogout = () => {
    setRole(null);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => (profileView === 'dashboard' ? setProfileView('options') : router.back())}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{profileView === 'dashboard' ? 'Tea Dashboard' : 'Tea Maker'}</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, profileView === 'options' && styles.optionsContent]}
          showsVerticalScrollIndicator={false}
        >
          {profileView === 'dashboard' ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Tea made today</Text>
                <Text style={styles.statValue}>{teaStats.totalTea}</Text>
                <Text style={styles.statNote}>cups prepared from today's orders</Text>
              </View>

              <View style={styles.miniStatsRow}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{teaStats.topTea}</Text>
                  <Text style={styles.miniStatLabel}>Top moved tea</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{teaStats.specialTeaQuantity}</Text>
                  <Text style={styles.miniStatLabel}>{teaStats.specialTeaName}</Text>
                </View>
              </View>

              <View style={styles.graphHeader}>
                <Text style={styles.sectionTitle}>Today's tea movement</Text>
                <Text style={styles.sectionCaption}>top cups</Text>
              </View>

              <View style={styles.graphCard}>
                <View style={styles.graphLines}>
                  <View style={styles.graphLine} />
                  <View style={styles.graphLine} />
                  <View style={styles.graphLine} />
                </View>
                <View style={styles.barsRow}>
                  {teaStats.teaBars.map((item) => (
                    <View key={item.name} style={styles.barSlot}>
                      <View style={[styles.bar, { height: `${Math.max((item.quantity / maxTeaValue) * 100, 12)}%` }]} />
                      <Text numberOfLines={1} style={styles.barLabel}>{item.name.split(' ')[0]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileMark}>
                <View style={styles.profileCupSteam} />
                <View style={styles.profileCup} />
                <View style={styles.profileCupHandle} />
                <Text style={styles.profileMarkTitle}>Tea Station</Text>
                <Text style={styles.profileMarkSub}>fresh cups, calm hands</Text>
              </View>

              <View style={styles.optionsList}>
                <OptionRow label="Notification" />
                <OptionRow label="Reset password" />
                <OptionRow label="Dashboard" onPress={() => setProfileView('dashboard')} />
                <OptionRow label="App settings" onPress={() => router.push('/settings')} />
                <OptionRow label="Logout" onPress={handleLogout} />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function OptionRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.72} onPress={onPress} style={styles.optionRow}>
      <Text style={styles.optionText}>{label}</Text>
      <Text style={styles.optionArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAPER },
  frame: { flex: 1, borderWidth: 1.4, borderColor: INK, backgroundColor: PAPER },
  header: { height: 68, borderBottomWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 54, borderRightWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  backText: { color: INK, fontSize: 32, lineHeight: 34 },
  title: { color: INK, fontSize: 18, fontWeight: '900', letterSpacing: 1.4 },
  content: { padding: 18, paddingBottom: 32 },
  statCard: { padding: 18, backgroundColor: TEA_BROWN, borderWidth: 1.2, borderColor: INK },
  statLabel: { color: PAPER, fontSize: 13, fontWeight: '800', letterSpacing: 0.7 },
  statValue: { marginTop: 6, color: PAPER, fontSize: 58, lineHeight: 64, fontWeight: '900' },
  statNote: { color: 'rgba(247, 233, 207, 0.78)', fontSize: 11, fontWeight: '700' },
  miniStatsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  miniStat: { flex: 1, minHeight: 92, padding: 12, borderWidth: 1.2, borderColor: INK, backgroundColor: PAPER, justifyContent: 'space-between' },
  miniStatValue: { color: INK, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  miniStatLabel: { marginTop: 8, color: INK, fontSize: 10, fontWeight: '900', letterSpacing: 0.6, opacity: 0.75 },
  graphHeader: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: INK, fontSize: 16, fontWeight: '900', letterSpacing: 0.8 },
  sectionCaption: { color: INK, fontSize: 10, fontWeight: '900', letterSpacing: 0.5, opacity: 0.58 },
  graphCard: { height: 190, marginTop: 10, paddingHorizontal: 12, paddingTop: 18, paddingBottom: 24, borderWidth: 1.2, borderColor: INK },
  graphLines: { ...StyleSheet.absoluteFillObject, top: 24, left: 12, right: 12, justifyContent: 'space-around' },
  graphLine: { height: 1, backgroundColor: INK, opacity: 0.18 },
  barsRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  barSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '76%', backgroundColor: ORANGE, borderWidth: 1.1, borderColor: INK },
  barLabel: { position: 'absolute', bottom: -17, color: INK, fontSize: 10, fontWeight: '900', maxWidth: 54 },
  optionsContent: { flexGrow: 1, justifyContent: 'flex-end' },
  profileMark: { alignItems: 'center', marginBottom: 112 },
  profileCupSteam: { width: 14, height: 28, borderLeftWidth: 2, borderColor: TEA_BROWN, borderRadius: 12, transform: [{ rotate: '16deg' }], opacity: 0.55 },
  profileCup: { width: 72, height: 42, marginTop: 4, borderWidth: 2, borderColor: TEA_BROWN, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  profileCupHandle: { position: 'absolute', top: 38, right: '36%', width: 22, height: 22, borderWidth: 2, borderColor: TEA_BROWN, borderRadius: 14 },
  profileMarkTitle: { marginTop: 16, color: INK, fontSize: 18, fontWeight: '900', letterSpacing: 1.2 },
  profileMarkSub: { marginTop: 4, color: INK, fontSize: 11, fontWeight: '800', opacity: 0.55, letterSpacing: 0.8 },
  optionsList: { marginTop: 0, marginBottom: 28 },
  optionRow: { minHeight: 52, borderBottomWidth: 1.1, borderColor: INK, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { color: INK, fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  optionArrow: { color: INK, fontSize: 22 },
});
