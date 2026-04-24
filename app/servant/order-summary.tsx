import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { Button, Card, SectionHeader } from '../../src/components/UIComponents';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { formatCurrency } from '../../src/utils/helpers';
import { COLORS } from '../../src/constants/theme';

/**
 * Order Summary Screen
 * Review before submitting to kitchen
 */
export default function OrderSummary() {
  const router = useRouter();
  const { tempCartItems, currentTableNumber, submitOrder, removeItemFromCart, theme } =
    useCafeFlowStore();
  
  const t = COLORS[theme];

  if (!currentTableNumber || tempCartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
        <View style={styles.emptyContainer}>

          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyEmoji}>🧺</Text>
          </View>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: t.muted }]}>Go back to the menu to add some items</Text>
          <TouchableOpacity 
            style={[styles.goBackBtn, { backgroundColor: t.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.goBackText, { color: '#121212' }]}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitOrder = () => {
    const order = submitOrder();
    if (order) {
      Alert.alert(
        'Order Submitted',
        `Order successfully sent to the kitchen!`,
        [
          {
            text: 'Great!',
            onPress: () => router.push('/servant'),
          },
        ]
      );
    }
  };

  const totalPrice = tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Group items by chef for display
  const itemsByChef = tempCartItems.reduce(
    (acc, item) => {
      if (!acc[item.assignedChef]) {
        acc[item.assignedChef] = [];
      }
      acc[item.assignedChef].push(item);
      return acc;
    },
    {} as Record<string, typeof tempCartItems>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      
      {/* Header */}

      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: t.surface }]}>
          <Text style={[styles.backArrow, { color: t.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: t.accent }]}>Review Order</Text>
          <Text style={[styles.headerSubtitle, { color: t.muted }]}>Table {currentTableNumber}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Modern Table Banner */}
        <View style={styles.tableBanner}>
          <View style={[styles.tableIconCircle, { backgroundColor: t.accent }]}>
             <Text style={[styles.tableIconText, { color: '#121212' }]}>{currentTableNumber}</Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.tableBannerTitle, { color: t.text }]}>Table {currentTableNumber}</Text>
            <Text style={[styles.tableBannerSubtitle, { color: t.muted }]}>{tempCartItems.length} items in current order</Text>
          </View>
        </View>

        {/* Grouped Tickets */}
        {Object.entries(itemsByChef).map(([chef, items]) => {
          const chefNames: Record<string, string> = {
            chef_a: 'Shigin · Tea Station',
            chef_b: 'Swadiq · Drinks & Snacks',
            chef_c: 'Jaslin · Wraps & Specials',
          };

          return (
            <View key={chef} style={[styles.chefTicket, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={[styles.ticketHeader, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
                <Text style={[styles.ticketTitle, { color: t.text }]}>{chefNames[chef] || chef}</Text>
                <View style={[styles.ticketCount, { backgroundColor: t.border }]}>
                   <Text style={[styles.ticketCountText, { color: t.text }]}>{items.length}</Text>
                </View>
              </View>
              
              <View style={styles.ticketBody}>
                {items.map((item, idx) => (
                  <View key={item.id} style={[styles.summaryItem, { borderBottomColor: t.border }, idx === items.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.itemInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Text style={[styles.itemQty, { color: t.accent }]}>{item.quantity}x</Text>
                         <Text style={[styles.itemName, { color: t.text }]}>{item.menuItemName}</Text>
                      </View>
                      <Text style={[styles.itemVariant, { color: t.muted }]}>{item.variantName}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={[styles.itemPrice, { color: t.text }]}>{formatCurrency(item.totalPrice)}</Text>
                      <TouchableOpacity 
                        onPress={() => removeItemFromCart(item.id)}
                        style={styles.removeBtn}
                      >
                         <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.finalTotalContainer}>
          <View style={styles.totalRow}>
             <Text style={styles.totalLabel}>Subtotal</Text>
             <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>
          <View style={styles.totalRow}>
             <Text style={styles.totalLabel}>Service Fee</Text>
             <Text style={styles.totalValue}>{formatCurrency(0)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.border }]}>
             <Text style={[styles.totalLabel, { color: t.text, fontSize: 18, fontWeight: '900' }]}>Total Amount</Text>
             <Text style={[styles.totalValue, { color: t.accent, fontSize: 24, fontWeight: '900' }]}>{formatCurrency(totalPrice)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: t.accent }]} onPress={handleSubmitOrder}>
          <Text style={[styles.submitBtnText, { color: '#121212' }]}>Send to Kitchen</Text>
          <View style={[styles.submitBtnIcon, { backgroundColor: 'rgba(18,18,18,0.1)' }]}>
             <Text style={{ color: '#121212', fontSize: 18 }}>→</Text>
          </View>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#111827',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  tableIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableIconText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  tableBannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  tableBannerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chefTicket: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ticketHeader: {
    backgroundColor: '#FAFAF9',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth:1,
    borderBottomColor: '#F3F4F6'
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketCountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#374151',
  },
  ticketBody: {
    paddingHorizontal: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemInfo: {
    flex: 1,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  itemVariant: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  removeBtn: {
    marginTop: 8,
  },
  removeText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },
  finalTotalContainer: {
    padding: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  submitBtn: {
    backgroundColor: '#059669',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  submitBtnIcon: {
     marginLeft: 15,
     width: 30,
     height: 30,
     borderRadius: 15,
     backgroundColor: 'rgba(255,255,255,0.2)',
     alignItems: 'center',
     justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
     width: 120,
     height: 120,
     borderRadius: 60,
     backgroundColor: '#F3F4F6',
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 30,
  },
  emptyEmoji: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  goBackBtn: {
    marginTop: 40,
    backgroundColor: '#111827',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 35,
  },
  goBackText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

