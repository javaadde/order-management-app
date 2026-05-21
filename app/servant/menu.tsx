import React, { useRef, useState } from 'react';
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

const PAPER = '#F7E9CF';
const TEA_BROWN = '#4B2B1A';
const INK = '#17120D';
const ORANGE = '#F26B2A';
const DRINK_SECTIONS = [
  { title: 'Lime', prefix: 'lime_' },
  { title: 'Mojito', prefix: 'mojito_' },
  { title: 'Soda', prefix: 'soda_' },
];
const TEA_SECTIONS = [
  { title: 'Black Tea', prefix: 'black_tea' },
  { title: 'Milk Tea', prefix: 'milk_tea' },
  { title: 'Healthy Tea', prefix: 'healthy_tea' },
];
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
  const { addItemToCart, tempCartItems, currentTableNumber } = useCafeFlowStore();
  const itemsScrollRef = useRef<ScrollView>(null);
  const menuSectionPositions = useRef<Record<string, number>>({});
  
  const [selectedCategory, setSelectedCategory] = useState<string>('tea');
  const [variantModal, setVariantModal] = useState<VariantModalState>({
    visible: false,
    menuItem: null,
    quantity: 1,
    selectedVariantId: null,
  });
  
  const categoryItems = getMenuItemsByCategory(selectedCategory);
  const tableLabel = currentTableNumber ? `Table (${TABLE_NAMES[currentTableNumber] ?? currentTableNumber})` : 'Select a table';
  const drinkSections = DRINK_SECTIONS.map((section) => ({
    ...section,
    items: categoryItems.filter((item) => item.id.startsWith(section.prefix)),
  })).filter((section) => section.items.length > 0);
  const teaSections = TEA_SECTIONS.map((section) => ({
    ...section,
    items: categoryItems.filter((item) => item.id.startsWith(section.prefix)),
  })).filter((section) => section.items.length > 0);
  const currentSubSections = selectedCategory === 'tea' ? teaSections : selectedCategory === 'cold_drinks' ? drinkSections : [];

  const jumpToMenuSection = (title: string) => {
    itemsScrollRef.current?.scrollTo({
      y: Math.max((menuSectionPositions.current[title] ?? 0) - 8, 0),
      animated: true,
    });
  };

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
        <View style={styles.heroBlock}>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/servant/order-summary')} style={styles.cartIconBtn}>
            <CartIcon />
            {tempCartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{tempCartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Menu</Text>
          <Text style={styles.heroSubtitle}>{tableLabel} · choose items</Text>
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

        <ScrollView
          ref={itemsScrollRef}
          style={styles.itemsScroll}
          contentContainerStyle={styles.itemsScrollContent}
          stickyHeaderIndices={[0]}
        >
          <View style={styles.stickyMenuHeader}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Menu'}</Text>
              <Text style={styles.sectionSubtitle}>Hand-picked favorites</Text>
            </View>

            {currentSubSections.length > 0 ? (
              <View style={styles.drinkJumpBar}>
                {currentSubSections.map((section) => (
                  <TouchableOpacity
                    key={section.title}
                    accessibilityRole="button"
                    activeOpacity={0.78}
                    onPress={() => jumpToMenuSection(section.title)}
                    style={styles.drinkJumpButton}
                  >
                    <Text style={styles.drinkJumpText}>{section.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.itemsContainer}>
            {currentSubSections.length > 0
              ? currentSubSections.map((section) => (
                  <View
                    key={section.title}
                    style={styles.drinkSection}
                    onLayout={(event) => {
                      menuSectionPositions.current[section.title] = event.nativeEvent.layout.y;
                    }}
                  >
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
          <View style={styles.modalContent}>
            {variantModal.menuItem && (
              <>
                <View style={styles.modalIndicator} />
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderGrid}>
                    <View style={styles.modalTextInfo}>
                      <Text style={styles.modalTitle}>{variantModal.menuItem.name}</Text>
                      <Text style={styles.modalSubtitle}>Choose quantity</Text>
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
                  {variantModal.menuItem.category !== 'tea' && variantModal.menuItem.variants.length > 1 ? (
                    <>
                      <Text style={styles.optionLabel}>Type</Text>
                      <View style={styles.variantGrid}>
                        {variantModal.menuItem.variants.map((variant) => {
                          const isSelected = variantModal.selectedVariantId === variant.id;
                          return (
                            <TouchableOpacity
                              key={variant.id}
                              onPress={() => setVariantModal({ ...variantModal, selectedVariantId: variant.id })}
                              style={[styles.variantChip, isSelected && styles.activeVariantChip]}
                            >
                              <Text style={[styles.variantChipText, isSelected && styles.activeVariantChipText]}>
                                {variant.name}
                              </Text>
                              <Text style={[styles.variantPriceModifier, isSelected && styles.activeVariantPriceText]}>
                                {variant.priceModifier >= 0 ? '+' : ''}{variant.priceModifier}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  ) : null}

                  <Text
                    style={[
                      styles.optionLabel,
                      variantModal.menuItem.category !== 'tea' &&
                        variantModal.menuItem.variants.length > 1 &&
                        styles.spacedOptionLabel,
                    ]}
                  >
                    Quantity
                  </Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      onPress={() => setVariantModal({ ...variantModal, quantity: Math.max(1, variantModal.quantity - 1) })}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{variantModal.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => setVariantModal({ ...variantModal, quantity: variantModal.quantity + 1 })}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <View style={styles.finalPriceContainer}>
                    <Text style={styles.finalPriceLabel}>Total Amount</Text>
                    <Text style={styles.finalPriceValue}>{formatCurrency(getTotalPrice())}</Text>
                  </View>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleAddToCart}>
                    <Text style={styles.confirmBtnText}>Add to Cart</Text>
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

function CartIcon() {
  return (
    <View style={styles.drawnCart}>
      <View style={styles.cartHandle} />
      <View style={styles.cartBasket} />
      <View style={styles.cartWheelLeft} />
      <View style={styles.cartWheelRight} />
    </View>
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
    color: PAPER,
    fontSize: 32,
    lineHeight: 34,
  },
  heroBlock: {
    height: 82,
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
    borderColor: 'rgba(247, 233, 207, 0.8)',
    backgroundColor: 'rgba(247, 233, 207, 0.16)',
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
  stickyMenuHeader: {
    backgroundColor: PAPER,
    paddingBottom: 10,
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
  drinkJumpBar: {
    marginHorizontal: 24,
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  drinkJumpButton: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1.1,
    borderColor: INK,
    backgroundColor: TEA_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkJumpText: {
    color: PAPER,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
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
    backgroundColor: 'rgba(23, 18, 13, 0.58)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: PAPER,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1.4,
    borderColor: INK,
    paddingTop: 12,
    paddingBottom: 26,
    maxHeight: '85%',
  },
  modalIndicator: {
    width: 54,
    height: 3,
    backgroundColor: TEA_BROWN,
    alignSelf: 'center',
    marginBottom: 18,
    opacity: 0.75,
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
  drawnCart: {
    width: 24,
    height: 22,
  },
  cartHandle: {
    position: 'absolute',
    top: 3,
    left: 1,
    width: 7,
    height: 2,
    backgroundColor: PAPER,
    transform: [{ rotate: '18deg' }],
  },
  cartBasket: {
    position: 'absolute',
    top: 7,
    left: 5,
    width: 16,
    height: 9,
    borderWidth: 1.8,
    borderColor: PAPER,
    borderTopWidth: 2,
  },
  cartWheelLeft: {
    position: 'absolute',
    bottom: 1,
    left: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PAPER,
  },
  cartWheelRight: {
    position: 'absolute',
    right: 3,
    bottom: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PAPER,
  },
  modalTextInfo: {
    flex: 1,
    paddingRight: 10,
  },
  modalItemImage: {
    width: 70,
    height: 70,
    borderWidth: 1.1,
    borderColor: INK,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: INK,
    fontWeight: '800',
    marginTop: 4,
    opacity: 0.58,
  },
  modalBody: {
    paddingHorizontal: 30,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  spacedOptionLabel: {
    marginTop: 30,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
    minWidth: '45%',
  },
  activeVariantChip: {
    borderColor: INK,
    backgroundColor: TEA_BROWN,
  },
  variantChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  activeVariantChipText: {
    color: PAPER,
  },
  variantPriceModifier: {
    fontSize: 12,
    color: INK,
    marginTop: 2,
    fontWeight: '600'
  },
  activeVariantPriceText: {
    color: PAPER,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 50,
    height: 50,
    borderWidth: 1.2,
    borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 24,
    fontWeight: '600',
    color: INK,
  },
  qtyValue: {
    fontSize: 24,
    fontWeight: '900',
    color: INK,
    marginHorizontal: 30,
  },
  modalFooter: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalPriceContainer: {
    flex: 1,
  },
  finalPriceLabel: {
    fontSize: 13,
    color: INK,
    fontWeight: '800',
    opacity: 0.62,
  },
  finalPriceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: INK,
  },
  confirmBtn: {
    backgroundColor: TEA_BROWN,
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderWidth: 1.2,
    borderColor: INK,
  },
  confirmBtnText: {
    color: PAPER,
    fontSize: 16,
    fontWeight: '800',
  },
});
