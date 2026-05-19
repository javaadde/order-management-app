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
import { useCafeFlowStore } from '../../src/store/cafeFlow';
import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  getMenuItemsByCategory,
} from '../../src/constants/menu';
import { MenuItem } from '../../src/types';
import { formatCurrency } from '../../src/utils/helpers';
import { COLORS } from '../../src/constants/theme';

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const ORANGE = '#F26B2A';
const DRINK_SECTIONS = [
  { title: 'Lime', prefix: 'lime_' },
  { title: 'Mojito', prefix: 'mojito_' },
  { title: 'Soda', prefix: 'soda_' },
];

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
  const { addItemToCart, tempCartItems, currentTableNumber, theme } = useCafeFlowStore();
  
  const t = COLORS[theme];

  const [selectedCategory, setSelectedCategory] = useState<string>('tea');
  const [variantModal, setVariantModal] = useState<VariantModalState>({
    visible: false,
    menuItem: null,
    quantity: 1,
    selectedVariantId: null,
  });
  
  const categoryItems = getMenuItemsByCategory(selectedCategory);
  const drinkSections = DRINK_SECTIONS.map((section) => ({
    ...section,
    items: categoryItems.filter((item) => item.id.startsWith(section.prefix)),
  })).filter((section) => section.items.length > 0);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/servant')} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/servant/order-summary')} style={styles.cartIconBtn}>
            <Text style={styles.cartIconText}>C</Text>
            {tempCartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{tempCartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Menu</Text>
          <Text style={styles.heroSubtitle}>{currentTableNumber ? `Table ${currentTableNumber}` : 'Select a table'} · choose items</Text>
        </View>

        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {MENU_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.activeCategoryChip,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.activeCategoryChipText,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.itemsScroll} contentContainerStyle={styles.itemsScrollContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Menu'}</Text>
            <Text style={styles.sectionSubtitle}>Hand-picked favorites</Text>
          </View>

          <View style={styles.itemsContainer}>
            {selectedCategory === 'cold_drinks'
              ? drinkSections.map((section) => (
                  <View key={section.title} style={styles.drinkSection}>
                    <Text style={styles.drinkSectionTitle}>{section.title}</Text>
                    {section.items.map((item) => (
                      <MenuItemRow key={item.id} item={item} onPress={() => handleSelectItem(item)} />
                    ))}
                  </View>
                ))
              : categoryItems.map((item) => <MenuItemRow key={item.id} item={item} onPress={() => handleSelectItem(item)} />)}
          </View>
        </ScrollView>
      </View>

      {/* Modern Floating Order Bar */}
      {tempCartItems.length > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity 
             style={styles.floatingCartBtn}
             onPress={() => router.push('/servant/order-summary')}
          >
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{tempCartItems.length}</Text>
            </View>
            <Text style={styles.cartBtnText}>View Order Summary</Text>
            <Text style={styles.cartBtnPrice}>
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

function MenuItemRow({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.itemCard}>
      <View style={styles.itemCardContent}>
        <View style={styles.itemImageContainer}>
          {item.image ? (
            <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <Text style={styles.itemEmoji}>☕</Text>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPriceLabel}>Starting from</Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.basePrice)}</Text>
        </View>
        <View style={styles.addBtnCircle}>
          <Text style={styles.addBtnIcon}>+</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAPER,
  },
  frame: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: PAPER,
    borderWidth: 1.4,
    borderColor: INK,
  },
  topBar: {
    height: 78,
    borderBottomWidth: 1.2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 54,
    borderRightWidth: 1.2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: INK,
    fontSize: 32,
    lineHeight: 34,
  },
  heroBlock: {
    height: 118,
    backgroundColor: TEA_BROWN,
    borderBottomWidth: 1.2,
    borderColor: INK,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroTitle: {
    color: PAPER,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroSubtitle: {
    marginTop: 5,
    color: 'rgba(247, 233, 207, 0.72)',
    fontSize: 11,
    fontWeight: '800',
  },
  cartIconBtn: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    width: 38,
    height: 38,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
    backgroundColor: ORANGE,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: INK,
  },
  cartBadgeText: {
    color: INK,
    fontSize: 10,
    fontWeight: '900',
  },
  categoryWrapper: {
    paddingTop: 18,
    marginBottom: -1.2,
    zIndex: 2,
  },
  categoryContent: {
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  categoryChip: {
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: INK,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#F1DFC0',
    marginRight: 6,
  },
  activeCategoryChip: {
    backgroundColor: TEA_BROWN,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.5,
  },
  activeCategoryChipText: {
    color: PAPER,
  },
  itemsScroll: {
    flex: 1,
  },
  itemsScrollContent: {
    paddingBottom: 150,
  },
  sectionHeader: {
    marginHorizontal: 24,
    padding: 14,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  sectionTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    marginTop: 3,
    color: INK,
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.55,
  },
  itemsContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  drinkSection: {
    marginBottom: 18,
  },
  drinkSectionTitle: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.1,
    borderColor: INK,
    color: INK,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  itemCard: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: '#FFF2D8',
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderWidth: 1.1,
    borderColor: INK,
    backgroundColor: PAPER,
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
    color: INK,
  },
  itemPriceLabel: {
    fontSize: 11,
    color: INK,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: TEA_BROWN,
  },
  addBtnCircle: {
    width: 36,
    height: 36,
    backgroundColor: ORANGE,
    borderWidth: 1.1,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: {
    color: INK,
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
    backgroundColor: TEA_BROWN,
    height: 65,
    borderWidth: 1.2,
    borderColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cartCountCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ORANGE,
    borderWidth: 1,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  cartBtnText: {
    flex: 1,
    marginLeft: 15,
    color: PAPER,
    fontSize: 16,
    fontWeight: '800',
  },
  cartBtnPrice: {
    color: PAPER,
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
  modalHeader: {
    paddingHorizontal: 30,
    marginBottom: 18,
  },
  cartIconText: {
    fontSize: 16,
    fontWeight: '900',
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
