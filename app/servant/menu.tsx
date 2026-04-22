import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Card,
  Badge,
  SectionHeader,
  QuantitySelector,
} from '../../src/components/UIComponents';
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  getMenuItemsByCategory,
} from '../../src/constants/menu';
import { MenuItem } from '../../src/types';
import { formatCurrency } from '../../src/utils/helpers';

interface VariantModalState {
  visible: boolean;
  menuItem: MenuItem | null;
  quantity: number;
  selectedVariantId: string | null;
}

/**
 * Menu Screen - Servant selects items for the order
 */
export default function MenuScreen() {
  const router = useRouter();
  const { addItemToCart, tempCartItems, submitOrder, currentTableNumber, selectTable } =
    useCafeFlowStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('tea');
  const [variantModal, setVariantModal] = useState<VariantModalState>({
    visible: false,
    menuItem: null,
    quantity: 1,
    selectedVariantId: null,
  });

  const categoryItems = getMenuItemsByCategory(selectedCategory);

  const handleSelectItem = (menuItem: MenuItem) => {
    const firstVariant = menuItem.variants[0];
    setVariantModal({
      visible: true,
      menuItem,
      quantity: 1,
      selectedVariantId: firstVariant.id,
    });
  };

  const handleAddToCart = () => {
    if (!variantModal.menuItem || !variantModal.selectedVariantId) return;

    addItemToCart(
      variantModal.menuItem.id,
      variantModal.selectedVariantId,
      variantModal.quantity
    );

    setVariantModal({
      visible: false,
      menuItem: null,
      quantity: 1,
      selectedVariantId: null,
    });
  };

  const handleSubmitOrder = () => {
    if (tempCartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    const order = submitOrder();
    if (order) {
      alert(`Order #${order.id.substring(0, 8)} submitted for Table ${currentTableNumber}`);
      router.push('/servant');
    }
  };

  const getTotalPrice = () => {
    if (!variantModal.menuItem || !variantModal.selectedVariantId) return 0;
    const variant = variantModal.menuItem.variants.find((v) => v.id === variantModal.selectedVariantId);
    if (!variant) return 0;
    return (variantModal.menuItem.basePrice + variant.priceModifier) * variantModal.quantity;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Items</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{tempCartItems.length}</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryContainer}>
          {MENU_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.activeCategoryButton,
              ]}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.activeCategoryButtonText,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Menu Items */}
      <ScrollView style={styles.itemsScroll}>
        <SectionHeader
          title={MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          subtitle={`${categoryItems.length} items available`}
        />

        <View style={styles.itemsContainer}>
          {categoryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelectItem(item)}
              activeOpacity={0.7}
            >
              <Card style={styles.itemCard}>
                <View style={styles.itemCardContent}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.variantsText}>
                      {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemPrice}>{formatCurrency(item.basePrice)}</Text>
                    <Text style={styles.addText}>Add +</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      {tempCartItems.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartBarLabel}>Items in Cart</Text>
            <Text style={styles.cartBarCount}>{tempCartItems.length}</Text>
          </View>
          <Button
            title="Review & Submit Order"
            onPress={() => router.push('/servant/order-summary')}
            variant="success"
            size="large"
            style={styles.submitBtn}
          />
        </View>
      )}

      {/* Variant Selection Modal */}
      <Modal
        visible={variantModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setVariantModal({ ...variantModal, visible: false })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {variantModal.menuItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{variantModal.menuItem.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setVariantModal({
                        ...variantModal,
                        visible: false,
                      })
                    }
                  >
                    <Text style={styles.modalCloseBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.variantsScroll}>
                  <Text style={styles.variantsLabel}>Select Variant:</Text>
                  {variantModal.menuItem.variants.map((variant) => (
                    <TouchableOpacity
                      key={variant.id}
                      onPress={() =>
                        setVariantModal({
                          ...variantModal,
                          selectedVariantId: variant.id,
                        })
                      }
                      style={[
                        styles.variantOption,
                        variantModal.selectedVariantId === variant.id && styles.selectedVariantOption,
                      ]}
                    >
                      <View style={styles.variantRadio}>
                        {variantModal.selectedVariantId === variant.id && (
                          <View style={styles.variantRadioSelected} />
                        )}
                      </View>
                      <Text style={styles.variantName}>{variant.name}</Text>
                      <Text style={styles.variantPrice}>
                        {formatCurrency(variantModal.menuItem.basePrice + variant.priceModifier)}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={[styles.variantsLabel, { marginTop: 24 }]}>Select Quantity:</Text>
                  <View style={styles.quantityControlContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        setVariantModal({
                          ...variantModal,
                          quantity: Math.max(1, variantModal.quantity - 1),
                        })
                      }
                      style={styles.qtyControlBtn}
                    >
                      <Text style={styles.qtyControlText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyControlValue}>{variantModal.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setVariantModal({
                          ...variantModal,
                          quantity: variantModal.quantity + 1,
                        })
                      }
                      style={styles.qtyControlBtn}
                    >
                      <Text style={styles.qtyControlText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.priceBreakdown}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Total Price:</Text>
                      <Text style={styles.priceAmount}>{formatCurrency(getTotalPrice())}</Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalButtons}>
                  <Button
                    title="Cancel"
                    onPress={() =>
                      setVariantModal({
                        ...variantModal,
                        visible: false,
                      })
                    }
                    variant="secondary"
                    size="large"
                    style={styles.modalBtn}
                  />
                  <Button
                    title="Add to Cart"
                    onPress={handleAddToCart}
                    variant="success"
                    size="large"
                    style={styles.modalBtn}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flex: 1,
    textAlign: 'center',
  },
  cartBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  categoryScroll: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryButtonText: {
    color: '#FFF',
  },

  itemsScroll: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  itemCard: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  itemCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  variantsText: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  addText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },

  bottomSpacer: {
    height: 100,
  },

  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cartBarLabel: {
    fontSize: 12,
    color: '#888',
  },
  cartBarCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 2,
  },
  submitBtn: {
    flex: 1,
    marginLeft: 12,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  modalCloseBtn: {
    fontSize: 24,
    color: '#999',
  },

  variantsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 300,
  },
  variantsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  variantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVariantOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  variantRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  variantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  qtyControlBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  qtyControlText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  qtyControlValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },

  priceBreakdown: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  modalBtn: {
    flex: 1,
  },
});
