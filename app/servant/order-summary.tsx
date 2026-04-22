import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, SectionHeader } from '../../src/components/UIComponents';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import { formatCurrency } from '../../src/utils/helpers';

/**
 * Order Summary Screen
 * Review before submitting to kitchen
 */
export default function OrderSummary() {
  const router = useRouter();
  const { tempCartItems, currentTableNumber, submitOrder, removeItemFromCart } =
    useCafeFlowStore();

  if (!currentTableNumber || tempCartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in order</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="large"
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitOrder = () => {
    const order = submitOrder();
    if (order) {
      Alert.alert(
        'Order Submitted',
        `Order #${order.id.substring(0, 8)} for Table ${currentTableNumber} has been sent to the kitchen!`,
        [
          {
            text: 'OK',
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Table Info */}
        <Card style={styles.tableInfoCard}>
          <View style={styles.tableInfoContent}>
            <Text style={styles.tableInfoLabel}>Table Number</Text>
            <Text style={styles.tableInfoNumber}>{currentTableNumber}</Text>
          </View>
        </Card>

        {/* Items by Chef */}
        {Object.entries(itemsByChef).map(([chef, items]) => {
          const chefNames: Record<string, string> = {
            chef_a: '🫖 Chef A (Tea Maker)',
            chef_b: '🍛 Chef B (Drinks & Snacks)',
            chef_c: '🌯 Chef C (Wraps & Specials)',
          };

          return (
            <View key={chef}>
              <SectionHeader
                title={chefNames[chef] || chef}
                subtitle={`${items.length} item${items.length !== 1 ? 's' : ''}`}
              />
              {items.map((item) => (
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.menuItemName}</Text>
                      <Text style={styles.itemVariant}>{item.variantName}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeItemFromCart(item.id)}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemFooter}>
                    <View>
                      <Text style={styles.qtyLabel}>Quantity: {item.quantity}</Text>
                      <Text style={styles.pricePerUnit}>
                        {formatCurrency(item.pricePerUnit)} each
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</Text>
                  </View>
                </Card>
              ))}
            </View>
          );
        })}

        {/* Summary Section */}
        <SectionHeader title="Order Total" subtitle="Final amount" />
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{tempCartItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total Amount:</Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>
              {formatCurrency(totalPrice)}
            </Text>
          </View>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Button
          title="Cancel Order"
          onPress={() => router.back()}
          variant="secondary"
          size="large"
          style={styles.btn}
        />
        <Button
          title="Submit to Kitchen"
          onPress={handleSubmitOrder}
          variant="success"
          size="large"
          style={styles.btn}
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  content: {
    flex: 1,
    paddingVertical: 8,
  },

  tableInfoCard: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tableInfoContent: {
    alignItems: 'center',
  },
  tableInfoLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  tableInfoNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginTop: 8,
  },

  itemCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  itemVariant: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF9500',
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  pricePerUnit: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#F0F0F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  totalLabel: {
    color: '#000',
    fontSize: 15,
  },
  totalValue: {
    fontSize: 18,
    color: '#34C759',
  },

  bottomSpacing: {
    height: 120,
  },

  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  btn: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
