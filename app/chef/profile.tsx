import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CHEF_INFO } from '../../src/constants/menu';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { ChefRole } from '../../src/types';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const ORANGE = '#F26B2A';

type ProfileView = 'options' | 'dashboard';

export default function ChefProfile() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const chefRole = ((role as ChefRole) || 'chef_b') as ChefRole;
  const chefInfo = CHEF_INFO[chefRole];
  const { allOrders, setRole } = useCafeFlowStore();
  const [profileView, setProfileView] = useState<ProfileView>('options');

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = allOrders
      .filter((order) => order.createdAt >= today.getTime())
      .flatMap((order) => order.items)
      .filter((item) => item.assignedChef === chefRole && item.status === 'ready');

    const totalMade = items.reduce((sum, item) => sum + item.quantity, 0);
    const itemTotals = items.reduce(
      (acc, item) => {
        acc[item.menuItemName] = (acc[item.menuItemName] ?? 0) + item.quantity;
        return acc;
      },
      {} as Record<string, number>
    );
    const topItems = Object.entries(itemTotals)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
    const countByName = (matcher: RegExp) =>
      items.reduce((sum, item) => (matcher.test(item.menuItemName) ? sum + item.quantity : sum), 0);

    return {
      totalMade,
      wrapsMade: countByName(/wrap/i),
      friesMade: countByName(/fries/i),
      momosMade: countByName(/momos/i),
      topItems: topItems.length > 0 ? topItems.slice(0, 5) : [
        { name: 'No items ready yet', quantity: 0 },
      ],
    };
  }, [allOrders, chefRole]);

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
          <Text style={styles.title}>{profileView === 'dashboard' ? 'Dashboard' : 'Kitchen'}</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, profileView === 'options' && styles.optionsContent]}
          showsVerticalScrollIndicator={false}
        >
          {profileView === 'dashboard' ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Orders made today</Text>
                <Text style={styles.statValue}>{stats.totalMade}</Text>
                <Text style={styles.statNote}>{chefInfo.specialty}</Text>
              </View>

              <View style={styles.miniStatsRow}>
                <MiniStat label="Wraps" value={stats.wrapsMade} />
                <MiniStat label="Fries" value={stats.friesMade} />
                <MiniStat label="Momos" value={stats.momosMade} />
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Best moving items</Text>
                {stats.topItems.map((item, index) => (
                  <View key={`${item.name}-${index}`} style={styles.rankRow}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <Text style={styles.rankName}>{item.name}</Text>
                    <Text style={styles.rankQty}>{item.quantity}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileMark}>
                <View style={styles.capTop} />
                <View style={styles.capCrown} />
                <View style={styles.capBand} />
                <Text style={styles.profileMarkTitle}>Kitchen Panel</Text>
                <Text style={styles.profileMarkSub}>{chefInfo.specialty}</Text>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
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
  optionsContent: { flexGrow: 1, justifyContent: 'flex-end' },
  profileMark: { alignItems: 'center', marginBottom: 112 },
  capTop: { width: 36, height: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 2, borderColor: TEA_BROWN, borderBottomWidth: 0 },
  capCrown: { width: 82, height: 38, borderTopLeftRadius: 42, borderTopRightRadius: 42, borderWidth: 2, borderColor: TEA_BROWN, borderBottomWidth: 0, marginTop: -2 },
  capBand: { width: 88, height: 14, borderWidth: 2, borderColor: TEA_BROWN },
  profileMarkTitle: { marginTop: 16, color: INK, fontSize: 18, fontWeight: '900', letterSpacing: 1.2 },
  profileMarkSub: { marginTop: 4, color: INK, fontSize: 11, fontWeight: '800', opacity: 0.55, letterSpacing: 0.8 },
  optionsList: { marginBottom: 28 },
  optionRow: { minHeight: 52, borderBottomWidth: 1.1, borderColor: INK, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { color: INK, fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  optionArrow: { color: INK, fontSize: 22 },
  statCard: { padding: 18, backgroundColor: TEA_BROWN, borderWidth: 1.2, borderColor: INK },
  statLabel: { color: PAPER, fontSize: 13, fontWeight: '800', letterSpacing: 0.7 },
  statValue: { marginTop: 6, color: PAPER, fontSize: 58, lineHeight: 64, fontWeight: '900' },
  statNote: { color: 'rgba(247, 233, 207, 0.78)', fontSize: 11, fontWeight: '700' },
  miniStatsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  miniStat: { flex: 1, padding: 12, borderWidth: 1.2, borderColor: INK, backgroundColor: PAPER, alignItems: 'center' },
  miniStatValue: { color: TEA_BROWN, fontSize: 28, lineHeight: 32, fontWeight: '900' },
  miniStatLabel: { marginTop: 4, color: INK, fontSize: 10, fontWeight: '900', opacity: 0.68 },
  sectionBox: { marginTop: 18, borderWidth: 1.2, borderColor: INK, backgroundColor: PAPER, padding: 14 },
  sectionTitle: { color: INK, fontSize: 16, fontWeight: '900', letterSpacing: 0.7, marginBottom: 10 },
  rankRow: { minHeight: 42, borderTopWidth: 1, borderColor: 'rgba(23, 18, 13, 0.28)', flexDirection: 'row', alignItems: 'center' },
  rankNumber: { width: 28, color: ORANGE, fontSize: 13, fontWeight: '900' },
  rankName: { flex: 1, color: INK, fontSize: 13, fontWeight: '900' },
  rankQty: { color: TEA_BROWN, fontSize: 13, fontWeight: '900' },
});
