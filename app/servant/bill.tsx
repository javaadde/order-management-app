import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const EXTRA_ITEMS = [
  { id: 'biscuit_10', name: 'Biscuit', price: 10 },
  { id: 'biscuit_5', name: 'Biscuit', price: 5 },
  { id: 'cake_15', name: 'Cake', price: 15 },
  { id: 'cupcake_10', name: 'Cupcake', price: 10 },
];

type ExtraLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function BillScreen() {
  const router = useRouter();
  const { tableId } = useLocalSearchParams<{ tableId: string }>();
  const tableNumber = Number(tableId);
  const { allOrders, deleteOrder } = useCafeFlowStore();
  const [extras, setExtras] = useState<ExtraLine[]>([]);

  const servedOrders = useMemo(
    () => allOrders.filter((order) => order.tableNumber === tableNumber && order.status === 'served'),
    [allOrders, tableNumber]
  );
  const orderedItems = servedOrders.flatMap((order) => order.items);
  const orderTotal = servedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const extrasTotal = extras.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = orderTotal + extrasTotal;

  const addExtra = (extra: (typeof EXTRA_ITEMS)[number]) => {
    setExtras((current) => {
      const existing = current.find((item) => item.id === extra.id);
      if (existing) {
        return current.map((item) =>
          item.id === extra.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...extra, quantity: 1 }];
    });
  };

  const removeExtra = (extraId: string) => {
    setExtras((current) =>
      current
        .map((item) => (item.id === extraId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePaid = () => {
    Alert.alert('Bill Paid', `Collect ${formatCurrency(grandTotal)} and free this table?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Paid',
        onPress: () => {
          servedOrders.forEach((order) => deleteOrder(order.id));
          router.replace('/servant');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.heroBlock}>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Bill</Text>
          <Text style={styles.heroSubtitle}>Table ({TABLE_NAMES[tableNumber] ?? tableNumber}) · final review</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Ordered items</Text>
            {orderedItems.length === 0 ? (
              <Text style={styles.emptyText}>No served orders for this table</Text>
            ) : (
              orderedItems.map((item) => (
                <View key={item.id} style={styles.billLine}>
                  <View style={styles.lineInfo}>
                    <Text style={styles.lineTitle}>{item.quantity}x {item.menuItemName}</Text>
                    <Text style={styles.lineSub}>{item.variantName}</Text>
                  </View>
                  <Text style={styles.linePrice}>{formatCurrency(item.totalPrice)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Forgot something?</Text>
            <Text style={styles.sectionHint}>Add extra biscuits or cakes before taking the bill.</Text>
            <View style={styles.extraButtons}>
              {EXTRA_ITEMS.map((extra) => (
                <TouchableOpacity key={extra.id} activeOpacity={0.78} onPress={() => addExtra(extra)} style={styles.extraButton}>
                  <Text style={styles.extraName}>{extra.name}</Text>
                  <Text style={styles.extraPrice}>{formatCurrency(extra.price)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {extras.length > 0 ? (
              <View style={styles.extraList}>
                {extras.map((extra) => (
                  <View key={extra.id} style={styles.billLine}>
                    <View style={styles.lineInfo}>
                      <Text style={styles.lineTitle}>{extra.quantity}x {extra.name}</Text>
                      <Text style={styles.lineSub}>extra item</Text>
                    </View>
                    <View style={styles.extraRight}>
                      <Text style={styles.linePrice}>{formatCurrency(extra.price * extra.quantity)}</Text>
                      <TouchableOpacity onPress={() => removeExtra(extra.id)}>
                        <Text style={styles.removeText}>Remove one</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Orders</Text>
              <Text style={styles.totalValue}>{formatCurrency(orderTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Extras</Text>
              <Text style={styles.totalValue}>{formatCurrency(extrasTotal)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.82} onPress={handlePaid} style={styles.paidButton}>
            <Text style={styles.paidButtonText}>Take Bill & Free Table</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAPER },
  frame: { flex: 1, backgroundColor: PAPER, borderWidth: 1.4, borderColor: INK, overflow: 'hidden' },
  heroBlock: { height: 92, backgroundColor: TEA_BROWN, borderBottomWidth: 1.2, borderColor: INK, justifyContent: 'center', paddingHorizontal: 72 },
  backButton: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 54, borderRightWidth: 1.2, borderColor: 'rgba(247, 233, 207, 0.45)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: PAPER, fontSize: 32, lineHeight: 34 },
  heroTitle: { color: PAPER, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  heroSubtitle: { marginTop: 5, color: 'rgba(247, 233, 207, 0.72)', fontSize: 11, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 112 },
  sectionBox: { borderWidth: 1.2, borderColor: INK, backgroundColor: PAPER, padding: 14, marginBottom: 16 },
  sectionTitle: { color: INK, fontSize: 17, fontWeight: '900', letterSpacing: 0.7, marginBottom: 10 },
  sectionHint: { color: INK, opacity: 0.58, fontSize: 11, fontWeight: '800', marginBottom: 12 },
  emptyText: { color: INK, opacity: 0.5, fontSize: 12, fontWeight: '800' },
  billLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: 'rgba(23, 18, 13, 0.28)', paddingVertical: 12 },
  lineInfo: { flex: 1, paddingRight: 12 },
  lineTitle: { color: INK, fontSize: 14, fontWeight: '900' },
  lineSub: { marginTop: 2, color: INK, opacity: 0.55, fontSize: 10, fontWeight: '800' },
  linePrice: { color: INK, fontSize: 14, fontWeight: '900' },
  extraButtons: { flexDirection: 'row', gap: 8 },
  extraButton: { flex: 1, borderWidth: 1.1, borderColor: INK, backgroundColor: '#FFF2D8', minHeight: 58, alignItems: 'center', justifyContent: 'center', padding: 6 },
  extraName: { color: INK, fontSize: 11, fontWeight: '900' },
  extraPrice: { marginTop: 3, color: TEA_BROWN, fontSize: 11, fontWeight: '900' },
  extraList: { marginTop: 12 },
  extraRight: { alignItems: 'flex-end' },
  removeText: { marginTop: 6, color: ORANGE, fontSize: 10, fontWeight: '900' },
  totalBox: { borderWidth: 1.2, borderColor: INK, padding: 16, backgroundColor: '#FFF2D8' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  totalLabel: { color: INK, opacity: 0.68, fontSize: 13, fontWeight: '800' },
  totalValue: { color: INK, fontSize: 14, fontWeight: '900' },
  grandTotalRow: { marginTop: 8, marginBottom: 0, paddingTop: 12, borderTopWidth: 1.1, borderColor: INK },
  grandTotalLabel: { color: INK, fontSize: 17, fontWeight: '900' },
  grandTotalValue: { color: TEA_BROWN, fontSize: 24, fontWeight: '900' },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  paidButton: { minHeight: 58, backgroundColor: TEA_BROWN, borderWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  paidButtonText: { color: PAPER, fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
});
