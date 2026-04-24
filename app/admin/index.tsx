import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { CHEF_INFO } from '../../src/constants/menu';
import { formatCurrency, formatTime } from '../../src/utils/helpers';
import { COLORS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

/**
 * Admin Panel - Manager Dashboard
 * Overview of all orders, revenue, and kitchen status
 * Protected by password (javad123)
 */
export default function AdminPanel() {
  const router = useRouter();
  const {
    allOrders,
    setRole,
    deleteOrder,
    clearCompletedOrders,
    theme,
  } = useCafeFlowStore();

  const t = COLORS[theme];

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'kitchen'>('overview');

  // Stats calculations
  const stats = useMemo(() => {
    const pending = allOrders.filter(o => o.status !== 'served');
    const served = allOrders.filter(o => o.status === 'served');
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const todayOrders = allOrders.length;

    // Items by chef
    const chefStats = {
      chef_a: { pending: 0, preparing: 0, ready: 0, revenue: 0, count: 0 },
      chef_b: { pending: 0, preparing: 0, ready: 0, revenue: 0, count: 0 },
      chef_c: { pending: 0, preparing: 0, ready: 0, revenue: 0, count: 0 },
    };

    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.assignedChef in chefStats) {
          const chefKey = item.assignedChef as keyof typeof chefStats;
          if (item.status in chefStats[chefKey]) {
            chefStats[chefKey][item.status as keyof typeof chefStats.chef_a]++;
          }
          chefStats[chefKey].revenue += item.totalPrice;
          chefStats[chefKey].count += item.quantity;
        }
      });
    });

    const topPerformer = (Object.keys(chefStats) as Array<keyof typeof chefStats>).reduce((a, b) => 
      chefStats[a].revenue > chefStats[b].revenue ? a : b
    );

    return { 
      pending, 
      served, 
      totalRevenue, 
      todayOrders, 
      chefStats,
      topPerformer 
    };
  }, [allOrders]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Exit admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: () => {
          setRole(null);
          router.push('/');
        },
      },
    ]);
  };

  const handleMarkServed = (orderId: string) => {
    Alert.alert('Mark as Served', 'Mark this order as served and complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Served',
        onPress: () => markOrderAsServed(orderId),
      },
    ]);
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert('Delete Order', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteOrder(orderId),
      },
    ]);
  };

  const handleClearCompleted = () => {
    Alert.alert('Clear History', 'Remove all completed orders from the list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => clearCompletedOrders(),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: t.accent }]}>Admin Panel</Text>
          <View style={[styles.managerBadge, { backgroundColor: theme === 'dark' ? 'rgba(67, 56, 202, 0.2)' : '#EEF2FF' }]}>
            <Text style={[styles.managerText, { color: theme === 'dark' ? '#818CF8' : '#4338CA' }]}>Manager Access</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabWrapper, { backgroundColor: t.card }]}>
        <View style={[styles.tabNavigation, { backgroundColor: t.surface }]}>
          {(['overview', 'orders', 'kitchen'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, isActive && [styles.activeTab, { backgroundColor: theme === 'dark' ? t.accent : '#FFF' }]]}
              >
                <Text style={[styles.tabText, isActive && { color: theme === 'dark' ? '#121212' : t.text }, !isActive && { color: t.muted }]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <View>
            {/* Revenue Card */}
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Today's Revenue</Text>
              <Text style={styles.revenueAmount}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.revenueSubtext}>{stats.todayOrders} total orders</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? t.surface : '#FEF3C7' }]}>
                <Text style={[styles.statNumber, { color: theme === 'dark' ? t.text : '#B45309' }]}>{stats.pending.length}</Text>
                <Text style={[styles.statLabel, { color: theme === 'dark' ? t.muted : '#92400E' }]}>Active Orders</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? t.surface : '#DCFCE7' }]}>
                <Text style={[styles.statNumber, { color: theme === 'dark' ? t.text : '#15803D' }]}>{stats.served.length}</Text>
                <Text style={[styles.statLabel, { color: theme === 'dark' ? t.muted : '#166534' }]}>Served Today</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? t.surface : '#EDE9FE' }]}>
                <Text style={[styles.statNumber, { color: theme === 'dark' ? t.text : '#6D28D9' }]}>{formatCurrency(stats.totalRevenue)}</Text>
                <Text style={[styles.statLabel, { color: theme === 'dark' ? t.muted : '#5B21B6' }]}>Gross Revenue</Text>
              </View>
            </View>

            {/* Performance Leaderboard */}
            <View style={[styles.sectionHeader, { marginTop: 30 }]}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>Top Performance</Text>
            </View>
            <View style={[styles.performanceCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.topWorkerHeader}>
                <Text style={styles.topWorkerEmoji}>🏆</Text>
                <View>
                  <Text style={[styles.topWorkerName, { color: t.text }]}>{CHEF_INFO[stats.topPerformer].name}</Text>
                  <Text style={[styles.topWorkerLabel, { color: t.muted }]}>Most Productive Station</Text>
                </View>
              </View>
              <View style={styles.competitonBar}>
                {(Object.keys(stats.chefStats) as Array<keyof typeof stats.chefStats>).map(key => {
                  const share = stats.totalRevenue > 0 ? (stats.chefStats[key].revenue / stats.totalRevenue) * 100 : 33.3;
                  return (
                    <View 
                      key={key} 
                      style={[
                        styles.barSegment, 
                        { width: `${share}%`, backgroundColor: CHEF_INFO[key].color }
                      ]} 
                    />
                  );
                })}
              </View>
            </View>

            {/* Kitchen Status */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kitchen Status</Text>
            </View>

            {(Object.keys(CHEF_INFO) as Array<keyof typeof CHEF_INFO>).map((chefKey) => {
              const chef = CHEF_INFO[chefKey];
              const chefStat = stats.chefStats[chefKey];
              const totalItems = chefStat.pending + chefStat.preparing + chefStat.ready;

              return (
                <View key={chefKey} style={[styles.kitchenCard, { backgroundColor: t.card, borderColor: t.border }]}>
                  <View style={styles.kitchenCardHeader}>
                    <View style={[styles.chefDot, { backgroundColor: chef.color }]} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.chefName, { color: t.text }]}>{chef.name}</Text>
                      <Text style={[styles.chefSpecialty, { color: t.muted }]}>{chef.specialty}</Text>
                    </View>
                    <View style={[styles.totalBadge, { backgroundColor: t.surface }]}>
                      <Text style={[styles.totalBadgeText, { color: t.accent }]}>{formatCurrency(chefStat.revenue)}</Text>
                    </View>
                  </View>
                  <View style={styles.chefStatRow}>
                    <View style={styles.chefStatItem}>
                      <Text style={[styles.chefStatValue, { color: t.text }]}>{chefStat.count}</Text>
                      <Text style={[styles.chefStatLabel, { color: t.muted }]}>Total Items Today</Text>
                    </View>
                    <View style={styles.chefStatItem}>
                      <Text style={[styles.chefStatValue, { color: t.accent }]}>{Math.round((chefStat.revenue / (stats.totalRevenue || 1)) * 100)}%</Text>
                      <Text style={[styles.chefStatLabel, { color: t.muted }]}>Market Share</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* === ORDERS TAB === */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Orders</Text>
              {stats.served.length > 0 && (
                <TouchableOpacity onPress={handleClearCompleted} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear Served</Text>
                </TouchableOpacity>
              )}
            </View>

            {allOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Text style={styles.emptyEmoji}>📋</Text>
                </View>
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Orders will appear here once placed</Text>
              </View>
            ) : (
              [...allOrders]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((order) => {
                  const allReady = order.items.every(i => i.status === 'ready');
                  const isServed = order.status === 'served';

                  return (
                    <View
                      key={order.id}
                      style={[
                        styles.orderCard,
                        isServed && styles.orderCardServed,
                      ]}
                    >
                      <View style={styles.orderCardHeader}>
                        <View style={[
                          styles.tableCircle,
                          isServed && { backgroundColor: '#D1D5DB' },
                        ]}>
                          <Text style={styles.tableCircleText}>{order.tableNumber}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                          <Text style={styles.orderTicketId}>
                            #{order.id.slice(-4).toUpperCase()}
                          </Text>
                          <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                        </View>
                        <View>
                          <Text style={styles.orderAmount}>{formatCurrency(order.totalPrice)}</Text>
                          <View style={[
                            styles.statusPill,
                            isServed
                              ? { backgroundColor: '#DCFCE7' }
                              : allReady
                                ? { backgroundColor: '#FEF3C7' }
                                : { backgroundColor: '#FEE2E2' },
                          ]}>
                            <Text style={[
                              styles.statusPillText,
                              isServed
                                ? { color: '#15803D' }
                                : allReady
                                  ? { color: '#B45309' }
                                  : { color: '#DC2626' },
                            ]}>
                              {isServed ? 'Served' : allReady ? 'Ready' : 'In Progress'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Items list */}
                      <View style={styles.orderItemsList}>
                        {order.items.map((item) => (
                          <View key={item.id} style={styles.orderItemRow}>
                            <Text style={styles.orderItemQty}>{item.quantity}x</Text>
                            <Text style={styles.orderItemName}>{item.menuItemName}</Text>
                            <View style={[
                              styles.itemStatusDot,
                              {
                                backgroundColor:
                                  item.status === 'ready'
                                    ? '#10B981'
                                    : item.status === 'preparing'
                                      ? '#F59E0B'
                                      : '#D1D5DB',
                              },
                            ]} />
                          </View>
                        ))}
                      </View>

                      {/* Action Buttons */}
                      {!isServed && (
                        <View style={styles.orderActions}>
                          {allReady && (
                            <TouchableOpacity
                              style={styles.serveBtn}
                              onPress={() => handleMarkServed(order.id)}
                            >
                              <Text style={styles.serveBtnText}>Mark Served</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteOrder(order.id)}
                          >
                            <Text style={styles.deleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
            )}
          </View>
        )}

        {/* === KITCHEN TAB === */}
        {activeTab === 'kitchen' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kitchen Stations</Text>
            </View>

            {(Object.keys(CHEF_INFO) as Array<keyof typeof CHEF_INFO>).map((chefKey) => {
              const chef = CHEF_INFO[chefKey];
              const chefOrders = allOrders.filter(order =>
                order.items.some(item => item.assignedChef === chefKey && item.status !== 'ready')
              );

              return (
                <View key={chefKey} style={styles.kitchenStationCard}>
                  <View style={styles.stationHeader}>
                    <View style={[styles.stationColorBar, { backgroundColor: chef.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stationName}>{chef.name}</Text>
                      <Text style={styles.stationSpecialty}>{chef.specialty}</Text>
                    </View>
                    <View style={[styles.stationBadge, { backgroundColor: chef.color + '20' }]}>
                      <Text style={[styles.stationBadgeText, { color: chef.color }]}>
                        {chefOrders.length} orders
                      </Text>
                    </View>
                  </View>

                  {chefOrders.length === 0 ? (
                    <View style={styles.stationEmpty}>
                      <Text style={styles.stationEmptyText}>All clear! 👨‍🍳</Text>
                    </View>
                  ) : (
                    chefOrders.map((order) => {
                      const chefItems = order.items.filter(i => i.assignedChef === chefKey);
                      return (
                        <View key={order.id} style={styles.stationOrder}>
                          <View style={styles.stationOrderHeader}>
                            <Text style={styles.stationTableText}>Table {order.tableNumber}</Text>
                            <Text style={styles.stationTicketText}>
                              #{order.id.slice(-4).toUpperCase()}
                            </Text>
                          </View>
                          {chefItems.map((item) => (
                            <View key={item.id} style={styles.stationItemRow}>
                              <Text style={styles.stationItemQty}>{item.quantity}x</Text>
                              <Text style={styles.stationItemName}>
                                {item.menuItemName} · {item.variantName}
                              </Text>
                              <View style={[
                                styles.stationItemStatus,
                                {
                                  backgroundColor:
                                    item.status === 'preparing'
                                      ? '#FEF3C7'
                                      : '#FEE2E2',
                                },
                              ]}>
                                <Text style={[
                                  styles.stationItemStatusText,
                                  {
                                    color:
                                      item.status === 'preparing'
                                        ? '#B45309'
                                        : '#DC2626',
                                  },
                                ]}>
                                  {item.status}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Quick Actions */}
      <View style={[styles.bottomBar, { backgroundColor: t.card, borderTopColor: t.border }]}>
        <View style={[styles.bottomBarInner, { backgroundColor: theme === 'dark' ? t.accent : '#111827' }]}>
          <View style={styles.bottomStat}>
            <Text style={[styles.bottomStatNumber, { color: theme === 'dark' ? '#121212' : '#FFF' }]}>{stats.pending.length}</Text>
            <Text style={[styles.bottomStatLabel, { color: theme === 'dark' ? 'rgba(18, 18, 18, 0.6)' : '#9CA3AF' }]}>Active</Text>
          </View>
          <View style={[styles.bottomDivider, { backgroundColor: theme === 'dark' ? 'rgba(18, 18, 18, 0.1)' : 'rgba(255,255,255,0.1)' }]} />
          <View style={styles.bottomStat}>
            <Text style={[styles.bottomStatNumber, { color: theme === 'dark' ? '#121212' : '#FFF' }]}>{stats.served.length}</Text>
            <Text style={[styles.bottomStatLabel, { color: theme === 'dark' ? 'rgba(18, 18, 18, 0.6)' : '#9CA3AF' }]}>Served</Text>
          </View>
          <View style={[styles.bottomDivider, { backgroundColor: theme === 'dark' ? 'rgba(18, 18, 18, 0.1)' : 'rgba(255,255,255,0.1)' }]} />
          <View style={styles.bottomStat}>
            <Text style={[styles.bottomStatNumber, { color: theme === 'dark' ? '#121212' : '#10B981' }]}>
              {formatCurrency(stats.totalRevenue)}
            </Text>
            <Text style={[styles.bottomStatLabel, { color: theme === 'dark' ? 'rgba(18, 18, 18, 0.6)' : '#9CA3AF' }]}>Revenue</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  managerBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  managerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338CA',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  tabWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  content: {
    flex: 1,
  },

  // Revenue Card
  revenueCard: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  revenueLabel: {
    fontSize: 13,
    color: '#A5B4FC',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  revenueAmount: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 8,
    letterSpacing: -1,
  },
  revenueSubtext: {
    fontSize: 14,
    color: '#818CF8',
    fontWeight: '600',
    marginTop: 6,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },

  // Kitchen Card
  kitchenCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  kitchenCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chefDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  chefName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  chefSpecialty: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },
  totalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  totalBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#374151',
  },
  chefStatRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 16,
  },
  chefStatItem: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 15,
    alignItems: 'center',
  },
  chefStatValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  chefStatLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Orders
  clearBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
  },
  clearBtnText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 45,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 6,
  },
  orderCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  orderCardServed: {
    opacity: 0.6,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  tableCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCircleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  orderTicketId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  orderTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'right',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderItemsList: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  orderItemQty: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    width: 30,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  itemStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  orderActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  serveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  serveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },

  // Kitchen Stations
  kitchenStationCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFAF9',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stationColorBar: {
    width: 5,
    height: 40,
    borderRadius: 3,
    marginRight: 14,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  stationSpecialty: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  stationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stationBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  stationEmpty: {
    paddingVertical: 25,
    alignItems: 'center',
  },
  stationEmptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  stationOrder: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  stationOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stationTableText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  stationTicketText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  stationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  stationItemQty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
    width: 25,
  },
  stationItemName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  stationItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stationItemStatusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  bottomBarInner: {
    flexDirection: 'row',
    backgroundColor: '#1E1B4B',
    borderRadius: 35,
    paddingHorizontal: 24,
    paddingVertical: 18,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomStat: {
    alignItems: 'center',
  },
  bottomStatNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  bottomStatLabel: {
    fontSize: 10,
    color: '#A5B4FC',
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bottomDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  performanceCard: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 30,
    borderWidth: 1,
    marginBottom: 20,
  },
  topWorkerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  topWorkerEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  topWorkerName: {
    fontSize: 22,
    fontWeight: '900',
  },
  topWorkerLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  competitonBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
});
