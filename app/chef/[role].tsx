import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Badge, SectionHeader, OrderItemCard } from '../../src/components/UIComponents';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { CHEF_INFO, getItemsForChef } from '../../src/constants/menu';
import { ChefRole, ItemStatus } from '../../src/types';
import { formatTime } from '../../src/utils/helpers';

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
    getAllPendingOrders,
    setRole,
    currentRole,
  } = useCafeFlowStore();
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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          setRole(null);
          router.push('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{chefInfo.name}</Text>
          <Text style={styles.headerSubtitle}>{chefInfo.specialty}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
          {ordersForChef.some((o) => o.items.some((i) => i.status === 'pending')) && (
            <Badge
              label={ordersForChef
                .flatMap((o) => o.items)
                .filter((i) => i.status === 'pending').length.toString()}
              color="#FF3B30"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('preparing')}
          style={[styles.tab, activeTab === 'preparing' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'preparing' && styles.activeTabText]}>
            Preparing
          </Text>
          {ordersForChef.some((o) => o.items.some((i) => i.status === 'preparing')) && (
            <Badge
              label={ordersForChef
                .flatMap((o) => o.items)
                .filter((i) => i.status === 'preparing').length.toString()}
              color="#FF9500"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('ready')}
          style={[styles.tab, activeTab === 'ready' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'ready' && styles.activeTabText]}>Ready</Text>
          {ordersForChef.some((o) => o.items.some((i) => i.status === 'ready')) && (
            <Badge
              label={ordersForChef
                .flatMap((o) => o.items)
                .filter((i) => i.status === 'ready').length.toString()}
              color="#34C759"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>✓</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'pending'
                ? 'No pending orders'
                : activeTab === 'preparing'
                  ? 'No items being prepared'
                  : 'No ready orders'}
            </Text>
            <Text style={styles.emptyStateHint}>
              New orders will appear here automatically
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderGroup}>
              {/* Order Header */}
              <Card
                style={[
                  styles.orderHeader,
                  {
                    backgroundColor:
                      activeTab === 'ready'
                        ? '#E8F5E9'
                        : activeTab === 'preparing'
                          ? '#FFF3E0'
                          : '#F5F5F5',
                  },
                ]}
              >
                <View style={styles.orderHeaderContent}>
                  <View>
                    <Text style={styles.tableNumber}>Table {order.tableNumber}</Text>
                    <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                  </View>
                  <View style={styles.itemCount}>
                    <Text style={styles.itemCountText}>{order.items.length} items</Text>
                  </View>
                </View>
              </Card>

              {/* Items */}
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
                  style={styles.itemTouchable}
                >
                  <OrderItemCard
                    key={item.id}
                    itemName={item.menuItemName}
                    variantName={item.variantName}
                    quantity={item.quantity}
                    price={item.totalPrice}
                    status={item.status}
                    backgroundColor={
                      item.status === 'ready'
                        ? '#E8F5E9'
                        : item.status === 'preparing'
                          ? '#FFF3E0'
                          : '#F0F0F0'
                    }
                  />
                </TouchableOpacity>
              ))}

              {/* Mark as Preparing / Done Button */}
              {activeTab === 'pending' && (
                <Button
                  title="Start Preparing"
                  onPress={() => {
                    order.items.forEach((item) => {
                      handleStatusChange(order.id, item.id, 'preparing');
                    });
                  }}
                  variant="primary"
                  size="medium"
                  style={styles.actionButton}
                />
              )}

              {activeTab === 'preparing' && (
                <Button
                  title="Mark All Ready"
                  onPress={() => {
                    order.items.forEach((item) => {
                      handleStatusChange(order.id, item.id, 'ready');
                    });
                  }}
                  variant="success"
                  size="medium"
                  style={styles.actionButton}
                />
              )}
            </View>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Quick Stats Bar */}
      {ordersForChef.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'preparing').length}
            </Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'ready').length}
            </Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#007AFF',
  },

  content: {
    flex: 1,
    paddingVertical: 8,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  emptyStateHint: {
    fontSize: 12,
    color: '#999',
  },

  orderGroup: {
    marginBottom: 16,
  },
  orderHeader: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  orderHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  orderTime: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  itemCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },

  itemTouchable: {
    marginHorizontal: 8,
    marginBottom: 4,
  },

  actionButton: {
    marginHorizontal: 12,
    marginVertical: 8,
  },

  bottomSpacing: {
    height: 80,
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
});
