import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { formatCurrency } from '../../src/utils/helpers';

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

export default function OrderSummary() {
  const router = useRouter();
  const { tempCartItems, currentTableNumber, submitOrder, removeItemFromCart } = useCafeFlowStore();

  const totalPrice = tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tableLabel = currentTableNumber ? `Table (${TABLE_NAMES[currentTableNumber] ?? currentTableNumber})` : 'No table';
  const itemsByChef = tempCartItems.reduce(
    (acc, item) => {
      if (!acc[item.assignedChef]) acc[item.assignedChef] = [];
      acc[item.assignedChef].push(item);
      return acc;
    },
    {} as Record<string, typeof tempCartItems>
  );

  const handleSubmitOrder = () => {
    const order = submitOrder();
    if (!order) return;

    Alert.alert('Order Submitted', 'Order successfully sent to the kitchen!', [
      { text: 'Great!', onPress: () => router.push('/servant') },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.heroBlock}>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Cart</Text>
          <Text style={styles.heroSubtitle}>{tableLabel} · review items</Text>
        </View>

        {!currentTableNumber || tempCartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BasketIcon />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Go back to the menu to add some items</Text>
            <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
              <Text style={styles.goBackText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
              <View style={styles.tableBanner}>
                <View style={styles.tableBadge}>
                  <Text style={styles.tableBadgeText}>{currentTableNumber}</Text>
                </View>
                <View>
                  <Text style={styles.tableTitle}>{tableLabel}</Text>
                  <Text style={styles.tableSubtitle}>{tempCartItems.length} items in current order</Text>
                </View>
              </View>

              {Object.entries(itemsByChef).map(([chef, items]) => {
                const chefNames: Record<string, string> = {
                  chef_a: 'Tea Station',
                  chef_b: 'Drinks & Snacks',
                  chef_c: 'Wraps & Specials',
                };

                return (
                  <View key={chef} style={styles.ticket}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketTitle}>{chefNames[chef] || chef}</Text>
                      <Text style={styles.ticketCount}>{items.length}</Text>
                    </View>
                    {items.map((item, index) => (
                      <View key={item.id} style={[styles.summaryItem, index === items.length - 1 && styles.lastSummaryItem]}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.quantity}x {item.menuItemName}</Text>
                          <Text style={styles.itemVariant}>{item.variantName}</Text>
                        </View>
                        <View style={styles.itemRight}>
                          <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
                          <TouchableOpacity onPress={() => removeItemFromCart(item.id)}>
                            <Text style={styles.removeText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}

              <View style={styles.totalCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Service Fee</Text>
                  <Text style={styles.totalValue}>{formatCurrency(0)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                  <Text style={styles.grandTotalLabel}>Total Amount</Text>
                  <Text style={styles.grandTotalValue}>{formatCurrency(totalPrice)}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitOrder}>
                <Text style={styles.submitBtnText}>Send to Kitchen</Text>
                <Text style={styles.submitArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function BasketIcon() {
  return (
    <View style={styles.basketIcon}>
      <View style={styles.basketHandle} />
      <View style={styles.basketBody} />
      <View style={styles.basketLineOne} />
      <View style={styles.basketLineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAPER },
  frame: { flex: 1, overflow: 'hidden', backgroundColor: PAPER, borderWidth: 1.4, borderColor: INK },
  heroBlock: { height: 92, backgroundColor: TEA_BROWN, borderBottomWidth: 1.2, borderColor: INK, justifyContent: 'center', paddingHorizontal: 72 },
  backButton: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 54, borderRightWidth: 1.2, borderColor: 'rgba(247, 233, 207, 0.45)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: PAPER, fontSize: 32, lineHeight: 34 },
  heroTitle: { color: PAPER, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  heroSubtitle: { marginTop: 5, color: 'rgba(247, 233, 207, 0.72)', fontSize: 11, fontWeight: '800' },
  content: { flex: 1 },
  contentBody: { padding: 20, paddingBottom: 118 },
  tableBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1.2, borderColor: INK, backgroundColor: PAPER, marginBottom: 16 },
  tableBadge: { width: 44, height: 44, borderWidth: 1.2, borderColor: INK, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  tableBadgeText: { color: INK, fontSize: 18, fontWeight: '900' },
  tableTitle: { color: INK, fontSize: 18, fontWeight: '900', letterSpacing: 0.6 },
  tableSubtitle: { marginTop: 3, color: INK, opacity: 0.58, fontSize: 11, fontWeight: '800' },
  ticket: { borderWidth: 1.2, borderColor: INK, backgroundColor: '#FFF2D8', marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1.1, borderColor: INK, backgroundColor: PAPER },
  ticketTitle: { color: INK, fontSize: 13, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  ticketCount: { color: INK, fontSize: 12, fontWeight: '900' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderColor: 'rgba(23, 18, 13, 0.3)' },
  lastSummaryItem: { borderBottomWidth: 0 },
  itemInfo: { flex: 1, paddingRight: 12 },
  itemName: { color: INK, fontSize: 15, fontWeight: '900' },
  itemVariant: { marginTop: 3, color: INK, opacity: 0.58, fontSize: 11, fontWeight: '800' },
  itemRight: { alignItems: 'flex-end' },
  itemPrice: { color: INK, fontSize: 15, fontWeight: '900' },
  removeText: { marginTop: 8, color: ORANGE, fontSize: 11, fontWeight: '900' },
  totalCard: { borderWidth: 1.2, borderColor: INK, padding: 16, backgroundColor: PAPER },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  totalLabel: { color: INK, opacity: 0.68, fontSize: 13, fontWeight: '800' },
  totalValue: { color: INK, fontSize: 14, fontWeight: '900' },
  grandTotalRow: { marginTop: 8, marginBottom: 0, paddingTop: 12, borderTopWidth: 1.1, borderColor: INK },
  grandTotalLabel: { color: INK, fontSize: 17, fontWeight: '900' },
  grandTotalValue: { color: TEA_BROWN, fontSize: 22, fontWeight: '900' },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  submitBtn: { height: 58, backgroundColor: TEA_BROWN, borderWidth: 1.2, borderColor: INK, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: PAPER, fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },
  submitArrow: { marginLeft: 14, color: PAPER, fontSize: 22, fontWeight: '900' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  basketIcon: { width: 118, height: 94, marginBottom: 30 },
  basketHandle: { position: 'absolute', top: 6, left: 33, width: 52, height: 38, borderWidth: 2, borderBottomWidth: 0, borderColor: TEA_BROWN, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  basketBody: { position: 'absolute', left: 18, right: 18, bottom: 10, height: 48, borderWidth: 2, borderColor: TEA_BROWN, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  basketLineOne: { position: 'absolute', left: 26, right: 26, bottom: 42, height: 2, backgroundColor: TEA_BROWN },
  basketLineTwo: { position: 'absolute', left: 30, right: 30, bottom: 28, height: 2, backgroundColor: TEA_BROWN, opacity: 0.7 },
  emptyText: { color: INK, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  emptySubtitle: { marginTop: 8, color: INK, opacity: 0.62, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  goBackBtn: { marginTop: 34, paddingHorizontal: 28, paddingVertical: 16, backgroundColor: TEA_BROWN, borderWidth: 1.2, borderColor: INK },
  goBackText: { color: PAPER, fontSize: 15, fontWeight: '900' },
});
