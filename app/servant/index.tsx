import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Badge, SectionHeader } from '../../src/components/UIComponents';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { TABLE_NUMBERS } from '../../src/constants/menu';
import { formatCurrency } from '../../src/utils/helpers';

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
  } = useCafeFlowStore();

  const [activeTab, setActiveTab] = useState<'tables' | 'orders' | 'cart'>('tables');
  const [showTableSelection, setShowTableSelection] = useState(!currentTableNumber);
  const allOrders = getAllPendingOrders();

  const handleSelectTable = (tableNumber: number) => {
    selectTable(tableNumber);
    setShowTableSelection(false);
  };

  const handleLogout = () => {
    setRole(null);
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CafeFlow Servant</Text>
          {currentTableNumber && (
            <Text style={styles.headerSubtitle}>Table {currentTableNumber}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          onPress={() => setActiveTab('tables')}
          style={[styles.tab, activeTab === 'tables' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'tables' && styles.activeTabText]}>
            Tables
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('orders')}
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            All Orders
          </Text>
          {allOrders.length > 0 && (
            <Badge label={allOrders.length.toString()} color="#FF3B30" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('cart')}
          style={[styles.tab, activeTab === 'cart' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
            Cart
          </Text>
          {tempCartItems.length > 0 && (
            <Badge label={tempCartItems.length.toString()} color="#34C759" />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'tables' && (
        <ScrollView style={styles.content}>
          <SectionHeader title="Select Table" subtitle="Choose a table to take order" />
          <View style={styles.tableGrid}>
            {TABLE_NUMBERS.map((tableNum) => {
              const tableOrders = allOrders.filter((o) => o.tableNumber === tableNum);
              const isSelected = currentTableNumber === tableNum;

              return (
                <TouchableOpacity
                  key={tableNum}
                  onPress={() => handleSelectTable(tableNum)}
                  style={[
                    styles.tableCard,
                    isSelected && styles.selectedTableCard,
                    tableOrders.length > 0 && styles.occupiedTableCard,
                  ]}
                >
                  <Text style={styles.tableNumber}>Table</Text>
                  <Text style={styles.tableNumBig}>{tableNum}</Text>
                  {tableOrders.length > 0 && (
                    <Badge label={`${tableOrders.length}`} color="#FF9500" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {activeTab === 'orders' && (
        <ScrollView style={styles.content}>
          <SectionHeader title="Pending Orders" subtitle={`${allOrders.length} active orders`} />
          {allOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No pending orders</Text>
            </View>
          ) : (
            allOrders.map((order) => (
              <Card key={order.id} style={styles.orderSummaryCard}>
                <View style={styles.orderSummaryHeader}>
                  <View>
                    <Text style={styles.orderTableNum}>Table {order.tableNumber}</Text>
                    <Text style={styles.orderItemCount}>{order.items.length} items</Text>
                  </View>
                  <View style={styles.orderSummaryRight}>
                    <Text style={styles.orderTotal}>{formatCurrency(order.totalPrice)}</Text>
                    <Badge
                      label={order.status.toUpperCase()}
                      color={
                        order.status === 'ready'
                          ? '#34C759'
                          : order.status === 'partially_ready'
                            ? '#FF9500'
                            : '#888888'
                      }
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {activeTab === 'cart' && (
        <ScrollView style={styles.content}>
          <SectionHeader
            title="Current Order"
            subtitle={currentTableNumber ? `Table ${currentTableNumber}` : 'No table selected'}
          />
          {tempCartItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Cart is empty</Text>
            </View>
          ) : (
            <>
              {tempCartItems.map((item) => (
                <Card key={item.id} style={styles.cartItemCard}>
                  <View style={styles.cartItemContent}>
                    <View style={styles.cartItemLeft}>
                      <Text style={styles.cartItemName}>{item.menuItemName}</Text>
                      <Text style={styles.cartItemVariant}>{item.variantName}</Text>
                    </View>
                    <View style={styles.cartItemRight}>
                      <Text style={styles.cartItemQty}>x{item.quantity}</Text>
                      <Text style={styles.cartItemPrice}>{formatCurrency(item.totalPrice)}</Text>
                    </View>
                  </View>
                </Card>
              ))}
              <View style={styles.cartTotalContainer}>
                <Text style={styles.cartTotalLabel}>Total:</Text>
                <Text style={styles.cartTotalAmount}>
                  {formatCurrency(tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0))}
                </Text>
              </View>
              <Button
                title="Go to Menu"
                onPress={() => router.push('/servant/menu')}
                variant="primary"
                size="large"
                style={styles.menuButton}
              />
            </>
          )}
        </ScrollView>
      )}

      {/* Bottom Action Button */}
      {activeTab === 'tables' && currentTableNumber && tempCartItems.length === 0 && (
        <View style={styles.bottomAction}>
          <Button
            title="Take Order for Table"
            onPress={() => router.push('/servant/menu')}
            variant="success"
            size="large"
          />
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

  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  tableCard: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTableCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  occupiedTableCard: {
    backgroundColor: '#FFF3E0',
  },
  tableNumber: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  tableNumBig: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginVertical: 4,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  orderSummaryCard: {
    marginHorizontal: 8,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTableNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  orderItemCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  orderSummaryRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },

  cartItemCard: {
    marginHorizontal: 8,
  },
  cartItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartItemLeft: {
    flex: 1,
  },
  cartItemRight: {
    alignItems: 'flex-end',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  cartItemVariant: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  cartItemQty: {
    fontSize: 12,
    color: '#999',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },

  cartTotalContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cartTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  menuButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
