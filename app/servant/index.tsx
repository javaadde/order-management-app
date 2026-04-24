import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { Button, Card, Badge, SectionHeader } from '../../src/components/UIComponents';
import { TABLE_NUMBERS } from '../../src/constants/menu';
import { formatCurrency } from '../../src/utils/helpers';
import { COLORS } from '../../src/constants/theme';

/**
 * Servant Panel - Main Order Taking Screen
 */
export default function ServantPanel() {
  const router = useRouter();
  const {
    currentTableNumber,
    tempCartItems,
    selectTable,
    getAllPendingOrders,
    setRole,
    theme,
  } = useCafeFlowStore();
  
  const t = COLORS[theme];

  const [activeTab, setActiveTab] = useState<'tables' | 'orders' | 'cart'>('tables');
  const allOrders = getAllPendingOrders();

  const handleSelectTable = (tableNumber: number) => {
    selectTable(tableNumber);
  };

  const handleLogout = () => {
    setRole(null);
    router.push('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: t.accent }]}>Kuttappi's Desk</Text>
          <Text style={[styles.headerSubtitle, { color: t.muted }]}>Order Management</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Floating Tab Navigation */}
      <View style={[styles.tabWrapper, { backgroundColor: t.card }]}>
        <View style={[styles.tabNavigation, { backgroundColor: t.surface }]}>
          {(['tables', 'orders', 'cart'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === 'orders' ? allOrders.length : tab === 'cart' ? tempCartItems.length : 0;
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
                  <View style={[styles.countBadge, isActive && { backgroundColor: theme === 'dark' ? '#121212' : t.accent }]}>
                    <Text style={[styles.countText, isActive && { color: theme === 'dark' ? t.accent : '#FFF' }, !isActive && { color: t.muted }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'tables' && (
          <View>
            <SectionHeader title="Assign Table" subtitle="Connect an order to a table" />
            <View style={styles.tableGrid}>
              {TABLE_NUMBERS.map((tableNum) => {
                const tableOrders = allOrders.filter((o) => o.tableNumber === tableNum);
                const isSelected = currentTableNumber === tableNum;

                return (
                  <TouchableOpacity
                    key={tableNum}
                    onPress={() => handleSelectTable(tableNum)}
                    activeOpacity={0.8}
                    style={[
                      styles.tableCard,
                      { backgroundColor: t.card, borderColor: t.border },
                      isSelected && [styles.selectedTableCard, { backgroundColor: t.accent, borderColor: t.accent }],
                      tableOrders.length > 0 && !isSelected && styles.occupiedTableCard,
                    ]}
                  >
                    <View style={styles.tableCardContent}>
                      <Text style={[styles.tableLabel, isSelected ? { color: '#121212' } : { color: t.muted }]}>Table</Text>
                      <Text style={[styles.tableNumBig, isSelected ? { color: '#121212' } : { color: t.text }]}>{tableNum}</Text>
                      {tableOrders.length > 0 && !isSelected && (
                        <View style={styles.miniStatusBadge}>
                          <View style={styles.statusDot} />
                          <Text style={styles.miniStatusText}>In Use</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'orders' && (
          <View>
            <SectionHeader title="Live Orders" subtitle={`${allOrders.length} orders in progress`} />
            {allOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyStateText}>Queue is clear</Text>
              </View>
            ) : (
              allOrders.map((order) => (
                <Card key={order.id} style={styles.orderSummaryCard}>
                  <View style={styles.orderSummaryHeader}>
                    <View style={styles.orderAvatar}>
                      <Text style={styles.avatarText}>{order.tableNumber}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={[styles.orderTableNum, { color: t.text }]}>Table {order.tableNumber}</Text>
                      <Text style={[styles.orderItemCount, { color: t.muted }]}>{order.items.length} items • Ordered just now</Text>
                    </View>
                    <View style={styles.orderSummaryRight}>
                      <Text style={[styles.orderTotal, { color: t.accent }]}>{formatCurrency(order.totalPrice)}</Text>
                      <Badge
                        label={order.status.replace('_', ' ')}
                        color={
                          order.status === 'ready'
                            ? t.accent
                            : order.status === 'partially_ready'
                              ? '#F59E0B'
                              : t.muted
                        }
                        textColor={order.status === 'ready' ? '#121212' : '#FFF'}
                      />
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {activeTab === 'cart' && (
          <View>
            <SectionHeader
              title="Checkout"
              subtitle={currentTableNumber ? `Active Table: ${currentTableNumber}` : 'Please select a table'}
            />
            {tempCartItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyStateText}>Your cart is waiting</Text>
                <Button 
                  title="Browse Menu" 
                  onPress={() => router.push('/servant/menu')} 
                  style={{ marginTop: 20 }}
                />
              </View>
            ) : (
              <>
                {tempCartItems.map((item) => (
                  <Card key={item.id} style={styles.cartItemCard}>
                    <View style={styles.cartItemContent}>
                      <View style={styles.cartItemLeft}>
                        <Text style={[styles.cartItemName, { color: t.text }]}>{item.menuItemName}</Text>
                        <Text style={[styles.cartItemVariant, { color: t.muted }]}>{item.variantName}</Text>
                        <View style={styles.priceTag}>
                           <Text style={[styles.cartItemPrice, { color: t.accent }]}>{formatCurrency(item.totalPrice)}</Text>
                        </View>
                      </View>
                      <View style={styles.cartItemRight}>
                        <View style={[styles.qtyBadge, { backgroundColor: t.surface }]}>
                           <Text style={[styles.qtyBadgeText, { color: t.text }]}>x{item.quantity}</Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
                
                <View style={[styles.summaryContainer, { backgroundColor: t.card, borderColor: t.border }]}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: t.muted }]}>Subtotal</Text>
                    <Text style={[styles.summaryValue, { color: t.text }]}>
                      {formatCurrency(tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0))}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderColor: t.border }]}>
                    <Text style={[styles.totalLabel, { color: t.text }]}>Total</Text>
                    <Text style={[styles.totalAmount, { color: t.accent }]}>
                      {formatCurrency(tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0))}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Review Order"
                  onPress={() => router.push('/servant/menu')}
                  variant="primary"
                  size="large"
                  style={styles.menuButton}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {activeTab === 'tables' && currentTableNumber && tempCartItems.length === 0 && (
        <View style={[styles.bottomAction, { backgroundColor: t.card, borderTopColor: t.border }]}>
          <TouchableOpacity 
            style={[styles.mainActionButton, { backgroundColor: t.accent }]}
            onPress={() => router.push('/servant/menu')}
          >
            <Text style={[styles.mainActionText, { color: '#121212' }]}>Open Menu for Table {currentTableNumber}</Text>
          </TouchableOpacity>
        </View>
      )}
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
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#A8A29E',
    fontWeight: '500',
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
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
    paddingVertical: 10,
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
  countBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  countBadgeActive: {
    backgroundColor: '#059669',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  countTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  tableCard: {
    width: (Dimensions.get('window').width - 48) / 3,
    aspectRatio: 0.9,
    marginBottom: 12,
    backgroundColor: '#1C1C1C',
    borderRadius: 24,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  tableCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  selectedTableCard: {
    backgroundColor: '#C5A47E',
    borderColor: '#C5A47E',
  },
  occupiedTableCard: {
    borderColor: '#C5A47E',
    borderWidth: 2,
  },
  tableLabel: {
    fontSize: 11,
    color: '#A8A29E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedTableLabel: {
    color: '#121212',
  },
  tableNumBig: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F5F5F5',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  selectedTableNum: {
    color: '#121212',
  },
  miniStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 4,
  },
  miniStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  orderSummaryCard: {
    marginHorizontal: 16,
  },
  orderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTableNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  orderItemCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  orderSummaryRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  cartItemCard: {
    marginHorizontal: 16,
    padding: 16,
  },
  cartItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemLeft: {
    flex: 1,
  },
  cartItemRight: {
    alignItems: 'flex-end',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  cartItemVariant: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  priceTag: {
    marginTop: 8,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  qtyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  qtyBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
  },
  menuButton: {
    marginHorizontal: 16,
    marginBottom: 40,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mainActionButton: {
    backgroundColor: '#059669',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  mainActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

