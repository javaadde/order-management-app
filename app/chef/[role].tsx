import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { CHEF_INFO } from '../../src/constants/menu';
import { ChefRole, ItemStatus } from '../../src/types';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const ORANGE = '#F26B2A';
const TABLE_NAMES: Record<number, string> = {
  1: 'bc',
  2: 'tc',
  3: 'cntr',
  4: 'lc',
  5: 'mj(majlis)',
  6: 'dw-r',
  7: 'dw-l',
  8: 'dw-c',
};

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
  } = useCafeFlowStore();

  const [activeTab, setActiveTab] = React.useState<'pending' | 'preparing' | 'ready'>('pending');

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

  if (chefRole === 'chef_a') {
    return <TeaMakerPanel />;
  }

  return (
    <SafeAreaView style={styles.chefPaperScreen}>
      <View style={styles.chefPaperFrame}>
        <View style={styles.chefHeroBlock}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open chef profile"
            onPress={() => router.push({ pathname: '/chef/profile', params: { role: chefRole } })}
            style={styles.chefProfileButton}
          >
            <View style={styles.chefProfileHead} />
            <View style={styles.chefProfileBody} />
          </TouchableOpacity>
          <Text style={styles.chefHeroTitle}>Kitchen</Text>
          <Text style={styles.chefHeroSubtitle}>{chefInfo.specialty} · kitchen board</Text>
        </View>

        <View style={styles.chefTabs}> 
          {(['pending', 'preparing', 'ready'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = ordersForChef.flatMap(o => o.items).filter(i => i.status === tab).length;
            const label = tab === 'pending' ? 'Orders' : tab === 'preparing' ? 'Making' : 'Ready';
            
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.chefTab, isActive && styles.activeChefTab]}
              >
                <Text style={[styles.chefTabText, isActive && styles.activeChefTabText]}>{label}</Text>
                <Text style={[styles.chefTabCount, isActive && styles.activeChefTabCount]}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView style={styles.chefBoardScroll} contentContainerStyle={styles.chefBoardContent}>
          {filteredOrders.length === 0 ? (
            <View style={styles.chefEmptyPanel}>
              <Text style={styles.chefEmptyTitle}>
                {activeTab === 'pending' ? 'No new orders' : activeTab === 'preparing' ? 'Nothing making' : 'Ready shelf empty'}
              </Text>
              <Text style={styles.chefEmptyHint}>Tickets will appear here as servants send orders.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.chefTicketCard}>
                <View style={styles.chefTicketHeader}>
                  <View style={styles.chefTableBadge}>
                    <Text style={styles.chefTableBadgeText}>{TABLE_NAMES[order.tableNumber] ?? order.tableNumber}</Text>
                  </View>
                  <View style={styles.chefTicketTitleWrap}>
                    <Text style={styles.chefTicketTitle}>Ticket #{order.id.slice(-4).toUpperCase()}</Text>
                    <Text style={styles.chefTicketSubtitle}>{order.items.length} items</Text>
                  </View>
                </View>

                {order.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={activeTab !== 'ready' ? 0.78 : 1}
                    onPress={() => {
                      const nextStatus: ItemStatus = item.status === 'pending' ? 'preparing' : item.status === 'preparing' ? 'ready' : 'ready';
                      handleStatusChange(order.id, item.id, nextStatus);
                    }}
                    style={[styles.chefItemRow, index === order.items.length - 1 && styles.lastChefItemRow]}
                  >
                    <View style={styles.chefItemInfo}>
                      <Text style={styles.chefItemName}>{item.quantity}x {item.menuItemName}</Text>
                      <Text style={styles.chefItemVariant}>{item.variantName}</Text>
                    </View>
                    {activeTab !== 'ready' ? <Text style={styles.chefItemAction}>{activeTab === 'pending' ? 'Start' : 'Ready'}</Text> : null}
                  </TouchableOpacity>
                ))}

                {activeTab !== 'ready' ? (
                  <TouchableOpacity
                    style={styles.chefTicketButton}
                    onPress={() => {
                      order.items.forEach((item) => {
                        handleStatusChange(order.id, item.id, activeTab === 'pending' ? 'preparing' : 'ready');
                      });
                    }}
                  >
                    <Text style={styles.chefTicketButtonText}>{activeTab === 'pending' ? 'Start All Items' : 'Move All To Ready'}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.chefStatsBar}>
          <StatCell label="Orders" value={ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'pending').length} />
          <StatCell label="Making" value={ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'preparing').length} />
          <StatCell label="Ready" value={ordersForChef.flatMap((o) => o.items).filter((i) => i.status === 'ready').length} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.chefStatCell}>
      <Text style={styles.chefStatValue}>{value}</Text>
      <Text style={styles.chefStatLabel}>{label}</Text>
    </View>
  );
}

function TeaMakerPanel() {
  const router = useRouter();
  const { allOrders, getOrdersForChef, updateItemStatus } = useCafeFlowStore();
  const [activeFolder, setActiveFolder] = React.useState<'orders' | 'making' | 'ready'>('orders');
  const teaTickets = useMemo(() => {
    return getOrdersForChef('chef_a').flatMap((order) =>
      order.items
        .filter((item) => item.assignedChef === 'chef_a')
        .map((item) => ({
          orderId: order.id,
          tableNumber: order.tableNumber,
          item,
        }))
    );
  }, [allOrders, getOrdersForChef]);

  const pendingTickets = teaTickets.filter((ticket) => ticket.item.status === 'pending');
  const makingTickets = teaTickets.filter((ticket) => ticket.item.status === 'preparing');
  const readyTickets = teaTickets.filter((ticket) => ticket.item.status === 'ready');
  const activeFolderConfig = {
    orders: {
      title: 'Orders',
      count: pendingTickets.length,
      tickets: pendingTickets,
      emptyText: 'No new tea orders',
      buttonLabel: 'Start making',
      onAdvance: (orderId: string, itemId: string) => updateItemStatus(orderId, itemId, 'preparing'),
    },
    making: {
      title: 'Making',
      count: makingTickets.length,
      tickets: makingTickets,
      emptyText: 'Nothing brewing now',
      buttonLabel: 'Move to ready',
      onAdvance: (orderId: string, itemId: string) => updateItemStatus(orderId, itemId, 'ready'),
    },
    ready: {
      title: 'Ready',
      count: readyTickets.length,
      tickets: readyTickets,
      emptyText: 'Ready list is empty',
      buttonLabel: undefined,
      onAdvance: undefined,
    },
  }[activeFolder];

  return (
    <SafeAreaView style={styles.teaMakerScreen}>
      <View style={styles.teaMakerFrame}>
        <View style={styles.teaMakerTopBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
            activeOpacity={0.72}
            onPress={() => router.push('/chef/tea-maker-profile')}
            style={styles.teaMakerUserButton}
          >
            <View style={styles.teaMakerUserHead} />
            <View style={styles.teaMakerUserBody} />
          </TouchableOpacity>
        </View>

        <View style={styles.teaMakerHeroBlock}>
          <Text style={styles.teaBoardTitle}>Tea Orders</Text>
          <Text style={styles.teaBoardSubtitle}>Move each cup from order to making to ready</Text>
        </View>
        <View style={styles.teaMakerPaper}>
          <View style={styles.teaFolderTabs}>
            {([
              ['orders', 'Orders', pendingTickets.length],
              ['making', 'Making', makingTickets.length],
              ['ready', 'Ready', readyTickets.length],
            ] as const).map(([folder, label, count]) => {
              const isActive = activeFolder === folder;

              return (
                <TouchableOpacity
                  key={folder}
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  onPress={() => setActiveFolder(folder)}
                  style={[styles.teaFolderTab, isActive && styles.activeTeaFolderTab]}
                >
                  <Text style={[styles.teaFolderTabText, isActive && styles.activeTeaFolderTabText]}>{label}</Text>
                  <Text style={[styles.teaFolderCount, isActive && styles.activeTeaFolderCount]}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.teaFolderPanel, activeFolderConfig.tickets.length === 0 && styles.emptyTeaFolderPanel]}>
            <View style={styles.teaFolderPanelHeader}>
              <Text style={styles.teaFolderPanelTitle}>{activeFolderConfig.title}</Text>
              <Text style={styles.teaFolderPanelMeta}>{activeFolderConfig.count} tickets</Text>
            </View>
            <TeaStatusColumn
              tickets={activeFolderConfig.tickets}
              emptyText={activeFolderConfig.emptyText}
              buttonLabel={activeFolderConfig.buttonLabel}
              onAdvance={activeFolderConfig.onAdvance}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function TeaStatusColumn({
  tickets,
  emptyText,
  buttonLabel,
  onAdvance,
}: {
  tickets: Array<{
    orderId: string;
    tableNumber: number;
    item: {
      id: string;
      menuItemName: string;
      variantName: string;
      quantity: number;
    };
  }>;
  emptyText: string;
  buttonLabel?: string;
  onAdvance?: (orderId: string, itemId: string) => void;
}) {
  return (
    <View style={[styles.teaFolderListWrap, tickets.length === 0 && styles.emptyTeaFolderListWrap]}>
      <ScrollView contentContainerStyle={styles.teaFolderList} showsVerticalScrollIndicator={false}>
        {tickets.length === 0 ? (
          <Text style={styles.teaEmptyText}>{emptyText}</Text>
        ) : (
          tickets.map((ticket) => (
            <View key={`${ticket.orderId}-${ticket.item.id}`} style={styles.teaTicketCard}>
              <View style={styles.teaTicketTopLine}>
                <Text style={styles.teaTicketTable}>T{ticket.tableNumber}</Text>
                <Text style={styles.teaTicketQty}>x{ticket.item.quantity}</Text>
              </View>
              <Text style={styles.teaTicketName}>{ticket.item.menuItemName}</Text>
              <Text style={styles.teaTicketVariant}>{ticket.item.variantName}</Text>
              {buttonLabel && onAdvance ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.78}
                  onPress={() => onAdvance(ticket.orderId, ticket.item.id)}
                  style={styles.teaTicketButton}
                >
                  <Text style={styles.teaTicketButtonText}>{buttonLabel}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chefPaperScreen: {
    flex: 1,
    backgroundColor: PAPER,
  },
  chefPaperFrame: {
    flex: 1,
    backgroundColor: PAPER,
    borderWidth: 1.4,
    borderColor: INK,
    overflow: 'hidden',
  },
  chefHeroBlock: {
    height: 108,
    backgroundColor: TEA_BROWN,
    borderBottomWidth: 1.2,
    borderColor: INK,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  chefHeroTitle: {
    color: PAPER,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  chefHeroSubtitle: {
    marginTop: 5,
    color: 'rgba(247, 233, 207, 0.72)',
    fontSize: 11,
    fontWeight: '800',
  },
  chefProfileButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 38,
    height: 36,
    borderWidth: 1.2,
    borderColor: 'rgba(247, 233, 207, 0.8)',
    backgroundColor: 'rgba(247, 233, 207, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefProfileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: PAPER,
  },
  chefProfileBody: {
    width: 21,
    height: 11,
    marginTop: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: PAPER,
  },
  chefTabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 14,
    marginBottom: -1.2,
    zIndex: 2,
  },
  chefTab: {
    minWidth: 94,
    height: 44,
    marginRight: 6,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: INK,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#F1DFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChefTab: {
    height: 52,
    backgroundColor: TEA_BROWN,
  },
  chefTabText: {
    color: INK,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  activeChefTabText: {
    color: PAPER,
  },
  chefTabCount: {
    marginTop: 2,
    color: INK,
    fontSize: 9,
    fontWeight: '900',
    opacity: 0.58,
  },
  activeChefTabCount: {
    color: PAPER,
  },
  chefBoardScroll: {
    flex: 1,
  },
  chefBoardContent: {
    paddingHorizontal: 20,
    paddingTop: 1,
    paddingBottom: 100,
  },
  chefEmptyPanel: {
    minHeight: 180,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  chefEmptyTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: '900',
  },
  chefEmptyHint: {
    marginTop: 8,
    color: INK,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.56,
    textAlign: 'center',
  },
  chefTicketCard: {
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: '#FFF2D8',
    marginBottom: 14,
  },
  chefTicketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1.1,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  chefTableBadge: {
    minWidth: 44,
    height: 40,
    borderWidth: 1.1,
    borderColor: INK,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chefTableBadgeText: {
    color: INK,
    fontSize: 12,
    fontWeight: '900',
  },
  chefTicketTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  chefTicketTitle: {
    color: INK,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  chefTicketSubtitle: {
    marginTop: 2,
    color: INK,
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.58,
  },
  chefItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(23, 18, 13, 0.3)',
  },
  lastChefItemRow: {
    borderBottomWidth: 0,
  },
  chefItemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  chefItemName: {
    color: INK,
    fontSize: 15,
    fontWeight: '900',
  },
  chefItemVariant: {
    marginTop: 3,
    color: INK,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.58,
  },
  chefItemAction: {
    color: TEA_BROWN,
    fontSize: 11,
    fontWeight: '900',
  },
  chefTicketButton: {
    minHeight: 42,
    margin: 14,
    borderWidth: 1.1,
    borderColor: INK,
    backgroundColor: TEA_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefTicketButtonText: {
    color: PAPER,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  chefStatsBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    minHeight: 58,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: TEA_BROWN,
    flexDirection: 'row',
  },
  chefStatCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: 'rgba(247, 233, 207, 0.34)',
  },
  chefStatValue: {
    color: PAPER,
    fontSize: 18,
    fontWeight: '900',
  },
  chefStatLabel: {
    marginTop: 2,
    color: 'rgba(247, 233, 207, 0.68)',
    fontSize: 10,
    fontWeight: '900',
  },
  teaMakerScreen: {
    flex: 1,
    backgroundColor: '#F7E9CF',
  },
  teaMakerFrame: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F7E9CF',
    borderWidth: 1.4,
    borderColor: '#17120D',
  },
  teaMakerTopBar: {
    height: 78,
    borderBottomWidth: 1.2,
    borderColor: '#17120D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teaMakerUserButton: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    width: 38,
    height: 38,
    borderWidth: 1.2,
    borderColor: '#17120D',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7E9CF',
  },
  teaMakerUserHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: '#17120D',
  },
  teaMakerUserBody: {
    width: 21,
    height: 11,
    marginTop: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: '#17120D',
  },
  teaMakerHeroBlock: {
    height: 118,
    backgroundColor: '#4B2B1A',
    borderBottomWidth: 1.2,
    borderColor: '#17120D',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  teaMakerPaper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  teaBoardTitle: {
    color: '#F7E9CF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  teaBoardSubtitle: {
    marginTop: 5,
    color: 'rgba(247, 233, 207, 0.72)',
    fontSize: 11,
    fontWeight: '800',
  },
  teaFolderTabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: -1.2,
    zIndex: 2,
  },
  teaFolderTab: {
    minWidth: 92,
    height: 46,
    marginRight: 5,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: '#17120D',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#F1DFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTeaFolderTab: {
    height: 52,
    backgroundColor: '#4B2B1A',
  },
  teaFolderTabText: {
    color: '#17120D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  activeTeaFolderTabText: {
    color: '#F7E9CF',
  },
  teaFolderCount: {
    marginTop: 2,
    color: '#17120D',
    fontSize: 9,
    fontWeight: '900',
    opacity: 0.58,
  },
  activeTeaFolderCount: {
    color: '#F7E9CF',
  },
  teaFolderPanel: {
    maxHeight: '100%',
    borderWidth: 1.2,
    borderColor: '#17120D',
    backgroundColor: '#F7E9CF',
    padding: 14,
    paddingBottom: 12,
  },
  emptyTeaFolderPanel: {
    paddingBottom: 20,
  },
  teaFolderPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1.1,
    borderColor: '#17120D',
  },
  teaFolderPanelTitle: {
    color: '#17120D',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  teaFolderPanelMeta: {
    color: '#17120D',
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.56,
  },
  teaFolderListWrap: {
    maxHeight: 430,
  },
  emptyTeaFolderListWrap: {
    maxHeight: 92,
  },
  teaFolderList: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  teaEmptyText: {
    paddingTop: 24,
    paddingBottom: 14,
    color: '#17120D',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '900',
    opacity: 0.46,
  },
  teaTicketCard: {
    marginBottom: 10,
    padding: 12,
    borderWidth: 1.1,
    borderColor: '#17120D',
    backgroundColor: '#FFF2D8',
  },
  teaTicketTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teaTicketTable: {
    color: '#17120D',
    fontSize: 10,
    fontWeight: '900',
  },
  teaTicketQty: {
    color: '#4B2B1A',
    fontSize: 10,
    fontWeight: '900',
  },
  teaTicketName: {
    marginTop: 8,
    color: '#17120D',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  teaTicketVariant: {
    marginTop: 2,
    color: '#17120D',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    opacity: 0.62,
  },
  teaTicketButton: {
    minHeight: 36,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F26B2A',
    borderWidth: 1,
    borderColor: '#17120D',
  },
  teaTicketButtonText: {
    color: '#17120D',
    fontSize: 10,
    fontWeight: '900',
  },
  teaMakerRule: {
    height: 1.2,
    marginBottom: 46,
    backgroundColor: '#17120D',
    opacity: 0.72,
  },
  teaMakerShortRule: {
    width: '72%',
  },
  container: {
    flex: 1,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  textureDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
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
