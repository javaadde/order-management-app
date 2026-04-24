import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

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
import { COLORS } from '../../src/constants/theme';

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
  const { addItemToCart, tempCartItems, submitOrder, currentTableNumber, selectTable, theme } =
    useCafeFlowStore();
  
  const t = COLORS[theme];

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

  const getTotalPrice = () => {
    if (!variantModal.menuItem || !variantModal.selectedVariantId) return 0;
    const variant = variantModal.menuItem.variants.find((v) => v.id === variantModal.selectedVariantId);
    if (!variant) return 0;
    return (variantModal.menuItem.basePrice + variant.priceModifier) * variantModal.quantity;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      
      {/* Dynamic Header */}

      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: t.surface }]}>
          <Text style={[styles.backArrow, { color: t.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: t.accent }]}>Menu</Text>
          <Text style={[styles.headerSubtitle, { color: t.muted }]}>Table {currentTableNumber || '??'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.cartIconBtn, { backgroundColor: theme === 'dark' ? 'rgba(197, 164, 126, 0.1)' : '#ECFDF5' }]}
          onPress={() => router.push('/servant/order-summary')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {tempCartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{tempCartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Selection Chips */}
      <View style={[styles.categoryWrapper, { backgroundColor: t.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {MENU_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                { backgroundColor: t.surface },
                selectedCategory === category.id && [styles.activeCategoryChip, { backgroundColor: t.accent }],
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: t.muted },
                  selectedCategory === category.id && [styles.activeCategoryChipText, { color: '#121212' }],
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Menu List */}
      <ScrollView 
        style={styles.itemsScroll}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <SectionHeader
          title={MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Menu'}
          subtitle="Hand-picked favorites"
        />

        <View style={styles.itemsContainer}>
          {categoryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelectItem(item)}
              activeOpacity={0.9}
            >
              <Card style={styles.itemCard}>
                <View style={styles.itemCardContent}>
                  <View style={[styles.itemImageContainer, { backgroundColor: t.surface }]}>
                    {item.image ? (
                      <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.itemEmoji}>☕</Text>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: t.text }]}>{item.name}</Text>
                    <Text style={[styles.itemPriceLabel, { color: t.muted }]}>Starting from</Text>
                    <Text style={[styles.itemPrice, { color: t.accent }]}>{formatCurrency(item.basePrice)}</Text>
                  </View>
                  <View style={[styles.addBtnCircle, { backgroundColor: t.accent }]}>
                    <Text style={[styles.addBtnIcon, { color: '#121212' }]}>+</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modern Floating Order Bar */}
      {tempCartItems.length > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity 
             style={[styles.floatingCartBtn, { backgroundColor: theme === 'dark' ? t.accent : '#111827' }]}
             onPress={() => router.push('/servant/order-summary')}
          >
            <View style={[styles.cartCountCircle, { backgroundColor: theme === 'dark' ? '#121212' : t.accent }]}>
              <Text style={[styles.cartCountText, { color: theme === 'dark' ? t.accent : '#FFF' }]}>{tempCartItems.length}</Text>
            </View>
            <Text style={[styles.cartBtnText, { color: theme === 'dark' ? '#121212' : '#FFF' }]}>View Order Summary</Text>
            <Text style={[styles.cartBtnPrice, { color: theme === 'dark' ? '#121212' : '#FFF' }]}>
              {formatCurrency(tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0))}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Sheet Modal for Variants */}
      <Modal
        visible={variantModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVariantModal({ ...variantModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={() => setVariantModal({ ...variantModal, visible: false })} 
          />
          <View style={[styles.modalContent, { backgroundColor: t.card }]}>
            {variantModal.menuItem && (
              <>
                <View style={[styles.modalIndicator, { backgroundColor: t.border }]} />
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderGrid}>
                    <View style={styles.modalTextInfo}>
                      <Text style={[styles.modalTitle, { color: t.text }]}>{variantModal.menuItem.name}</Text>
                      <Text style={[styles.modalSubtitle, { color: t.muted }]}>Customize your selection</Text>
                    </View>
                    {variantModal.menuItem.image && (
                      <Image 
                        source={variantModal.menuItem.image} 
                        style={styles.modalItemImage} 
                        resizeMode="cover" 
                      />
                    )}
                  </View>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={[styles.optionLabel, { color: t.text }]}>Size / Type</Text>
                  <View style={styles.variantGrid}>
                    {variantModal.menuItem.variants.map((variant) => {
                      const isSelected = variantModal.selectedVariantId === variant.id;
                      return (
                        <TouchableOpacity
                          key={variant.id}
                          onPress={() => setVariantModal({ ...variantModal, selectedVariantId: variant.id })}
                          style={[
                            styles.variantChip, 
                            { backgroundColor: t.surface, borderColor: t.border },
                            isSelected && [styles.activeVariantChip, { borderColor: t.accent, backgroundColor: theme === 'dark' ? 'rgba(197, 164, 126, 0.1)' : '#ECFDF5' }]
                          ]}
                        >
                          <Text style={[styles.variantChipText, { color: t.text }, isSelected && [styles.activeVariantChipText, { color: t.accent }]]}>
                            {variant.name}
                          </Text>
                          <Text style={[styles.variantPriceModifier, { color: t.muted }, isSelected && [styles.activeVariantPriceText, { color: t.accent }]]}>
                            {variant.priceModifier >= 0 ? '+' : ''}{variant.priceModifier}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.optionLabel, { marginTop: 30, color: t.text }]}>Quantity</Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      onPress={() => setVariantModal({ ...variantModal, quantity: Math.max(1, variantModal.quantity - 1) })}
                      style={[styles.qtyBtn, { backgroundColor: t.surface }]}
                    >
                      <Text style={[styles.qtyBtnText, { color: t.text }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyValue, { color: t.text }]}>{variantModal.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => setVariantModal({ ...variantModal, quantity: variantModal.quantity + 1 })}
                      style={[styles.qtyBtn, { backgroundColor: t.surface }]}
                    >
                      <Text style={[styles.qtyBtnText, { color: t.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <View style={[styles.modalFooter, { borderTopColor: t.border }]}>
                  <View style={styles.finalPriceContainer}>
                    <Text style={[styles.finalPriceLabel, { color: t.muted }]}>Total Amount</Text>
                    <Text style={[styles.finalPriceValue, { color: t.text }]}>{formatCurrency(getTotalPrice())}</Text>
                  </View>
                  <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: t.accent }]} onPress={handleAddToCart}>
                    <Text style={[styles.confirmBtnText, { color: '#121212' }]}>Add to Cart</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#FAFAF9',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth:1,
    borderBottomColor:'#F3F4F6'
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
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  categoryWrapper: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  activeCategoryChip: {
    backgroundColor: '#111827',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeCategoryChipText: {
    color: '#FFF',
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  itemPriceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  addBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  floatingCartBtn: {
    backgroundColor: '#111827',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cartCountCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  cartBtnText: {
    flex: 1,
    marginLeft: 15,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cartBtnPrice: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 15,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTextInfo: {
    flex: 1,
    paddingRight: 10,
  },
  modalItemImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  modalBody: {
    paddingHorizontal: 30,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAF9',
    minWidth: '45%',
  },
  activeVariantChip: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  variantChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  activeVariantChipText: {
    color: '#065F46',
  },
  variantPriceModifier: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600'
  },
  activeVariantPriceText: {
    color: '#059669'
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  qtyValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginHorizontal: 30,
  },
  modalFooter: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalPriceContainer: {
    flex: 1,
  },
  finalPriceLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  finalPriceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  confirmBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 30,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

