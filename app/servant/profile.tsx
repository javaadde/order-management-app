import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../../src/store/cafeFlow';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const ORANGE = '#F26B2A';
const INK = '#17120D';

type GraphRange = 'weekly' | 'monthly';
type ProfileView = 'options' | 'dashboard';

const weeklyFallback = [12, 18, 15, 24, 21, 28, 16];
const monthlyFallback = [72, 94, 88, 116];
const rushHourLabels = ['8a', '10a', '12p', '2p', '4p', '6p'];
const rushHourFallback = [3, 7, 14, 9, 12, 5];

function getStartOfDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getOrdersForDay(allOrders: ReturnType<typeof useCafeFlowStore.getState>['allOrders'], offset = 0) {
  const start = getStartOfDay(offset);
  const end = start + 24 * 60 * 60 * 1000;
  return allOrders.filter((order) => order.createdAt >= start && order.createdAt < end);
}

export default function ServantProfile() {
  const router = useRouter();
  const { allOrders, setRole } = useCafeFlowStore();
  const [graphRange, setGraphRange] = useState<GraphRange>('weekly');
  const [profileView, setProfileView] = useState<ProfileView>('options');

  const orderStats = useMemo(() => {
    const todayOrders = getOrdersForDay(allOrders, 0);
    const yesterdayOrders = getOrdersForDay(allOrders, -1);
    const difference = todayOrders.length - yesterdayOrders.length;
    const percent = yesterdayOrders.length > 0 ? Math.round((difference / yesterdayOrders.length) * 100) : null;

    const hourlyBuckets = [8, 10, 12, 14, 16, 18].map((hour) => {
      return todayOrders.filter((order) => new Date(order.createdAt).getHours() >= hour && new Date(order.createdAt).getHours() < hour + 2).length;
    });

    const recentDayRush = Array.from({ length: 7 }, (_, index) => {
      const offset = index - 6;
      const dayOrders = getOrdersForDay(allOrders, offset);
      const peak = [8, 10, 12, 14, 16, 18].reduce((max, hour) => {
        const count = dayOrders.filter((order) => new Date(order.createdAt).getHours() >= hour && new Date(order.createdAt).getHours() < hour + 2).length;
        return Math.max(max, count);
      }, 0);

      return peak;
    });

    return {
      today: todayOrders.length,
      yesterday: yesterdayOrders.length,
      difference,
      percent,
      hourlyBuckets: hourlyBuckets.some(Boolean) ? hourlyBuckets : rushHourFallback,
      recentDayRush: recentDayRush.some(Boolean) ? recentDayRush : weeklyFallback,
    };
  }, [allOrders]);

  const graphData = graphRange === 'weekly' ? orderStats.recentDayRush : monthlyFallback;
  const maxGraphValue = Math.max(...graphData);
  const maxRushValue = Math.max(...orderStats.hourlyBuckets);
  const comparisonText =
    orderStats.yesterday === 0
      ? 'No orders yesterday to compare'
      : `${orderStats.difference >= 0 ? '+' : ''}${orderStats.difference} orders (${orderStats.percent}%) vs yesterday`;

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
          <Text style={styles.title}>{profileView === 'dashboard' ? 'Dashboard' : 'Account'}</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, profileView === 'options' && styles.optionsContent]}
          showsVerticalScrollIndicator={false}
        >
          {profileView === 'dashboard' ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Orders taken today</Text>
                <Text style={styles.statValue}>{orderStats.today}</Text>
                <Text style={styles.statNote}>{comparisonText}</Text>
              </View>

              <View style={styles.miniStatsRow}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{orderStats.yesterday}</Text>
                  <Text style={styles.miniStatLabel}>Yesterday</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{Math.max(...orderStats.hourlyBuckets)}</Text>
                  <Text style={styles.miniStatLabel}>Peak rush</Text>
                </View>
              </View>

              <View style={styles.graphHeader}>
                <Text style={styles.sectionTitle}>Rush timeline</Text>
                <Text style={styles.sectionCaption}>today by hour</Text>
              </View>

              <View style={styles.graphCard}>
                <View style={styles.graphLines}>
                  <View style={styles.graphLine} />
                  <View style={styles.graphLine} />
                  <View style={styles.graphLine} />
                </View>
                <View style={styles.barsRow}>
                  {orderStats.hourlyBuckets.map((value, index) => (
                    <View key={`rush-${rushHourLabels[index]}`} style={styles.barSlot}>
                      <View style={[styles.bar, styles.rushBar, { height: `${Math.max((value / maxRushValue) * 100, 12)}%` }]} />
                      <Text style={styles.barLabel}>{rushHourLabels[index]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.graphHeader}>
                <Text style={styles.sectionTitle}>Rush comparison</Text>
                <View style={styles.segmentedControl}>
                  <RangeButton active={graphRange === 'weekly'} label="Weekly" onPress={() => setGraphRange('weekly')} />
                  <RangeButton active={graphRange === 'monthly'} label="Monthly" onPress={() => setGraphRange('monthly')} />
                </View>
              </View>

              <View style={styles.graphCard}>
                <View style={styles.graphLines}>
                  <View style={styles.graphLine} />
                  <View style={styles.graphLine} />
                  <View style={styles.graphLine} />
                </View>
                <View style={styles.barsRow}>
                  {graphData.map((value, index) => (
                    <View key={`${graphRange}-${index}`} style={styles.barSlot}>
                      <View style={[styles.bar, { height: `${Math.max((value / maxGraphValue) * 100, 12)}%` }]} />
                      <Text style={styles.barLabel}>{graphRange === 'weekly' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] : `W${index + 1}`}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileMark}>
                <View style={styles.profileTrayCupLeft} />
                <View style={styles.profileTrayCupRight} />
                <View style={styles.profileTrayTop} />
                <View style={styles.profileTrayBase} />
                <Text style={styles.profileMarkTitle}>Servant Desk</Text>
                <Text style={styles.profileMarkSub}>orders moving cleanly</Text>
              </View>

              <View style={styles.optionsList}>
                <OptionRow label="Notification" />
                <OptionRow label="Reset password" />
                <OptionRow label="Dashboard" onPress={() => setProfileView('dashboard')} />
                <OptionRow label="App settings" />
                <OptionRow label="Logout" onPress={handleLogout} />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function RangeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[styles.rangeButton, active && styles.activeRangeButton]}>
      <Text style={[styles.rangeText, active && styles.activeRangeText]}>{label}</Text>
    </TouchableOpacity>
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
  screen: {
    flex: 1,
    backgroundColor: PAPER,
  },
  frame: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  header: {
    height: 68,
    borderBottomWidth: 1.2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 54,
    borderRightWidth: 1.2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: INK,
    fontSize: 32,
    lineHeight: 34,
  },
  title: {
    color: INK,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  statCard: {
    padding: 18,
    backgroundColor: TEA_BROWN,
    borderWidth: 1.2,
    borderColor: INK,
  },
  statLabel: {
    color: PAPER,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  statValue: {
    marginTop: 6,
    color: PAPER,
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '900',
  },
  statNote: {
    color: 'rgba(247, 233, 207, 0.78)',
    fontSize: 11,
    fontWeight: '700',
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  miniStat: {
    flex: 1,
    padding: 12,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  miniStatValue: {
    color: INK,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  miniStatLabel: {
    marginTop: 2,
    color: INK,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    opacity: 0.75,
  },
  graphHeader: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sectionCaption: {
    color: INK,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    opacity: 0.58,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1.2,
    borderColor: INK,
  },
  rangeButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: PAPER,
  },
  activeRangeButton: {
    backgroundColor: ORANGE,
  },
  rangeText: {
    color: INK,
    fontSize: 10,
    fontWeight: '900',
  },
  activeRangeText: {
    color: INK,
  },
  graphCard: {
    height: 190,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1.2,
    borderColor: INK,
  },
  graphLines: {
    ...StyleSheet.absoluteFillObject,
    top: 24,
    left: 12,
    right: 12,
    justifyContent: 'space-around',
  },
  graphLine: {
    height: 1,
    backgroundColor: INK,
    opacity: 0.18,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '76%',
    backgroundColor: TEA_BROWN,
    borderWidth: 1.1,
    borderColor: INK,
  },
  rushBar: {
    backgroundColor: ORANGE,
  },
  barLabel: {
    position: 'absolute',
    bottom: -17,
    color: INK,
    fontSize: 10,
    fontWeight: '900',
  },
  optionsList: {
    marginTop: 22,
    marginBottom: 28,
  },
  optionsContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  profileMark: {
    alignItems: 'center',
    marginBottom: 112,
  },
  profileTrayCupLeft: {
    width: 18,
    height: 30,
    marginRight: 34,
    borderWidth: 2,
    borderColor: TEA_BROWN,
  },
  profileTrayCupRight: {
    position: 'absolute',
    top: 0,
    width: 18,
    height: 30,
    marginLeft: 34,
    borderWidth: 2,
    borderColor: TEA_BROWN,
  },
  profileTrayTop: {
    width: 92,
    height: 2,
    marginTop: 10,
    backgroundColor: TEA_BROWN,
  },
  profileTrayBase: {
    width: 104,
    height: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: TEA_BROWN,
  },
  profileMarkTitle: {
    marginTop: 16,
    color: INK,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  profileMarkSub: {
    marginTop: 4,
    color: INK,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.55,
    letterSpacing: 0.8,
  },
  optionRow: {
    minHeight: 46,
    borderBottomWidth: 1.1,
    borderColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    color: INK,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  optionArrow: {
    color: INK,
    fontSize: 22,
  },
});
