import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { OrderItemCard } from '../../src/components/UIComponents';
import { CHEF_INFO, MENU_ITEMS } from '../../src/constants/menu';
import { ChefRole, ItemStatus } from '../../src/types';
import { formatTime } from '../../src/utils/helpers';
import { COLORS } from '../../src/constants/theme';

/**
 * Chef Panel - Dynamic route for each chef (chef_a, chef_b, chef_c)
 * Shows incoming orders and items specific to each chef
 */
export default function ChefPanel() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const {
    updateItemStatus,
    getOrdersForChef,
    setRole,
    theme,
  } = useCafeFlowStore();

  const t = COLORS[theme];
  const [activeTab, setActiveTab] = React.useState<'pending' | 'preparing' | 'ready'>('pending');
  const [refreshing, setRefreshing] = React.useState(false);

  const chefRole = (role as ChefRole) || 'chef_a';
  const chefInfo = CHEF_INFO[chefRole];

  // Get all orders that have items for this chef
  const ordersForChef = useMemo(() => {
    return getOrdersForChef(chefRole);
  }, [chefRole, getOrdersForChef]);

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    return ordersForChef
      .map((order) => ({
        ...order,
        items: order.items.filter((item) => {
          const isAssigned = item.assignedChef === chefRole;
          if (!isAssigned) return false;
          
          if (activeTab === 'pending') return item.status === 'pending';
          if (activeTab === 'preparing') return item.status === 'preparing';
          if (activeTab === 'ready') return item.status === 'ready';
          return true;
        }),
      }))
      .filter((order) => order.items.length > 0);
  }, [ordersForChef, activeTab]);

  const handleStatusChange = useCallback(
    (orderId: string, itemId: string, newStatus: ItemStatus) => {
      updateItemStatus(orderId, itemId, newStatus);
    },
    [updateItemStatus]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from the kitchen?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setRole(null);
          router.push('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: t.accent }]}>{chefInfo.name}</Text>
          <View style={[styles.specialtyBadge, { backgroundColor: theme === 'dark' ? 'rgba(197, 164, 126, 0.1)' : '#ECFDF5' }]}>
            <Text style={[styles.specialtyText, { color: theme === 'dark' ? t.accent : '#059669' }]}>{chefInfo.specialty}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Exit Kitchen</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Kitchen Tabs */}
      <View style={[styles.tabWrapper, { backgroundColor: t.card }]}>
        <View style={[styles.tabNavigation, { backgroundColor: t.surface }]}>
          {(['pending', 'preparing', 'ready'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = ordersForChef.flatMap(o => o.items).filter(i => i.status === tab).length;
            const tabColor = tab === 'pending' ? '#EF4444' : tab === 'preparing' ? '#F59E0B' : t.accent;
            
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, isActive && [styles.activeTab, { backgroundColor: theme === 'dark' ? t.accent : '#FFF' }]]}
              >
                <Text style={[styles.tabText, isActive && { color: theme === 'dark' ? '#121212' : t.text }, !isActive && { color: t.muted }]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, { backgroundColor: isActive ? (theme === 'dark' ? '#121212' : tabColor) : t.border }]}>
                    <Text style={[styles.tabBadgeText, { color: isActive ? (theme === 'dark' ? t.accent : '#FFF') : t.muted }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Kitchen Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
               <Text style={styles.emptyEmoji}>👨‍🍳</Text>
            </View>
            <Text style={styles.emptyStateText}>
              {activeTab === 'pending'
                ? 'All Caught Up!'
                : activeTab === 'preparing'
                  ? 'No Active Prep'
                  : 'Ready Station Empty'}
            </Text>
            <Text style={styles.emptyStateHint}>
              New kitchen tickets will appear here automatically
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={[styles.orderGroup, { backgroundColor: t.card, borderColor: t.border }]}>
              {/* Modern Ticket Header */}
              <View style={[styles.ticketHeader, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
                <View style={[styles.tableIndicator, { backgroundColor: activeTab === 'pending' ? '#EF4444' : activeTab === 'preparing' ? '#F59E0B' : t.accent }]}>
                  <Text style={[styles.tableIndicatorText, { color: (activeTab === 'ready' && theme === 'dark') ? '#121212' : '#FFF' }]}>{order.tableNumber}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.ticketTitle, { color: t.text }]}>Ticket #{order.id.slice(-4).toUpperCase()}</Text>
                  <Text style={[styles.ticketTime, { color: t.muted }]}>Received: {formatTime(order.createdAt)}</Text>
                </View>
                <View style={[styles.ticketBadge, { backgroundColor: t.border }]}>
                  <Text style={[styles.ticketBadgeText, { color: t.text }]}>{order.items.length} items</Text>
                </View>
              </View>

              {/* Items List */}
              <View style={styles.itemsList}>
                {order.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      const nextStatus: ItemStatus =
                        item.status === 'pending'
                          ? 'preparing'
                          : item.status === 'preparing'
                            ? 'ready'
                            : 'ready';

                      handleStatusChange(order.id, item.id, nextStatus);
                    }}
                    activeOpacity={activeTab !== 'ready' ? 0.7 : 1}
                    style={styles.itemWrapper}
                  >
                    <OrderItemCard
                      itemName={item.menuItemName}
                      variantName={item.variantName}
                      quantity={item.quantity}
                      price={item.totalPrice}
                      status={item.status}
                      image={MENU_ITEMS.find(m => m.id === item.menuItemId)?.image}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Bar for Ticket */}
              <View style={styles.ticketFooter}>
                {activeTab === 'pending' && (
                  <TouchableOpacity 
                    style={styles.actionBtnPrimary}
                    onPress={() => {
                      order.items.forEach((item) => {
                        handleStatusChange(order.id, item.id, 'preparing');
                      });
                    }}
                  >
                    <Text style={styles.actionBtnText}>Accept All Items</Text>
                  </TouchableOpacity>
                )}

                {activeTab === 'preparing' && (
                  <TouchableOpacity 
                    style={styles.actionBtnSuccess}
                    onPress={() => {
                      order.items.forEach((item) => {
                        handleStatusChange(order.id, item.id, 'ready');
                      });
                    }}
                  >
                    <Text style={styles.actionBtnText}>Mark All as Ready</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Kitchen Stats */}
      <View style={styles.statsBarWrapper}>
         <View style={[styles.statsBar, { backgroundColor: t.accent }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#121212' }]}>
              {ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'pending').length}
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(18, 18, 18, 0.6)' }]}>Pending</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(18, 18, 18, 0.1)' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#121212' }]}>
              {ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'preparing').length}
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(18, 18, 18, 0.6)' }]}>Active</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(18, 18, 18, 0.1)' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#121212' }]}>
              {ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'ready').length}
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(18, 18, 18, 0.6)' }]}>Ready</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#C5A47E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -1,
  },

  specialtyBadge: {
    backgroundColor: 'rgba(197, 164, 126, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C5A47E',
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
    backgroundColor: '#1C1C1C',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C',
    borderRadius: 30,
    padding: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#C5A47E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A8A29E',
  },
  activeTabText: {
    color: '#121212',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 50,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  orderGroup: {
    backgroundColor: '#1C1C1C',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#262626',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  tableIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableIndicatorText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F5F5F5',
  },
  ticketTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  ticketBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ticketBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  itemsList: {
    paddingVertical: 10,
  },
  itemWrapper: {
    marginVertical: -8, // Tighter stacking of cards
  },
  ticketFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtnPrimary: {
    backgroundColor: '#059669',
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSuccess: {
    backgroundColor: '#10B981',
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statsBarWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#C5A47E',
    borderRadius: 35,
    paddingHorizontal: 24,
    paddingVertical: 18,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#121212',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(18, 18, 18, 0.7)',
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.2)',
    marginHorizontal: 10,
  },
  bottomSpacing: {
    height: 120,
  },
});

