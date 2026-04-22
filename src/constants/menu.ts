import { MenuItem } from '../types';

/**
 * Menu items database
 * In production, this would come from a backend API
 */
export const MENU_ITEMS: MenuItem[] = [
  // TEA CATEGORY
  {
    id: 'black_tea',
    name: 'Black Tea',
    category: 'tea',
    basePrice: 80,
    chef: 'chef_a',
    variants: [
      { id: 'bt_normal', name: 'Normal', priceModifier: 0 },
      { id: 'bt_lemon', name: 'Lemon', priceModifier: 10 },
      { id: 'bt_ginger', name: 'Ginger', priceModifier: 15 },
      { id: 'bt_mint', name: 'Mint', priceModifier: 10 },
    ],
  },
  {
    id: 'milk_tea',
    name: 'Milk Tea',
    category: 'tea',
    basePrice: 100,
    chef: 'chef_a',
    variants: [
      { id: 'mt_normal', name: 'Normal', priceModifier: 0 },
      { id: 'mt_strong', name: 'Strong', priceModifier: 15 },
      { id: 'mt_cardamom', name: 'Cardamom', priceModifier: 20 },
    ],
  },
  {
    id: 'green_tea',
    name: 'Green Tea',
    category: 'tea',
    basePrice: 90,
    chef: 'chef_a',
    variants: [
      { id: 'gt_normal', name: 'Normal', priceModifier: 0 },
      { id: 'gt_honey', name: 'Honey', priceModifier: 15 },
      { id: 'gt_jasmine', name: 'Jasmine', priceModifier: 20 },
    ],
  },
  {
    id: 'herbal_tea',
    name: 'Herbal Tea',
    category: 'tea',
    basePrice: 120,
    chef: 'chef_a',
    variants: [
      { id: 'ht_chamomile', name: 'Chamomile', priceModifier: 0 },
      { id: 'ht_tulsi', name: 'Tulsi', priceModifier: 10 },
    ],
  },

  // COLD DRINKS CATEGORY
  {
    id: 'lime_drink',
    name: 'Lime',
    category: 'cold_drinks',
    basePrice: 60,
    chef: 'chef_b',
    variants: [
      { id: 'lime_classic', name: 'Classic', priceModifier: 0 },
      { id: 'lime_mint', name: 'Mint', priceModifier: 10 },
      { id: 'lime_salt', name: 'Salt', priceModifier: 5 },
      { id: 'lime_sweet', name: 'Sweet', priceModifier: 0 },
    ],
  },
  {
    id: 'mojito',
    name: 'Mojito',
    category: 'cold_drinks',
    basePrice: 100,
    chef: 'chef_b',
    variants: [
      { id: 'moj_classic', name: 'Classic', priceModifier: 0 },
      { id: 'moj_blue', name: 'Blue', priceModifier: 20 },
      { id: 'moj_strawberry', name: 'Strawberry', priceModifier: 20 },
    ],
  },
  {
    id: 'soda',
    name: 'Soda',
    category: 'cold_drinks',
    basePrice: 50,
    chef: 'chef_b',
    variants: [
      { id: 'soda_plain', name: 'Plain', priceModifier: 0 },
      { id: 'soda_lemon', name: 'Lemon Soda', priceModifier: 10 },
      { id: 'soda_orange', name: 'Orange Soda', priceModifier: 10 },
    ],
  },

  // STARTERS CATEGORY
  {
    id: 'french_fries',
    name: 'French Fries',
    category: 'starters',
    basePrice: 120,
    chef: 'chef_b',
    variants: [
      { id: 'ff_regular', name: 'Regular', priceModifier: 0 },
      { id: 'ff_cheese', name: 'Cheese', priceModifier: 30 },
    ],
  },
  {
    id: 'peri_fries',
    name: 'Peri Peri Fries',
    category: 'starters',
    basePrice: 140,
    chef: 'chef_b',
    variants: [
      { id: 'pf_mild', name: 'Mild', priceModifier: 0 },
      { id: 'pf_spicy', name: 'Spicy', priceModifier: 0 },
    ],
  },
  {
    id: 'nuggets',
    name: 'Nuggets',
    category: 'starters',
    basePrice: 180,
    chef: 'chef_b',
    variants: [
      { id: 'ng_regular', name: 'Regular', priceModifier: 0 },
      { id: 'ng_spicy', name: 'Spicy', priceModifier: 10 },
    ],
  },
  {
    id: 'momos',
    name: 'Momos (Fried)',
    category: 'starters',
    basePrice: 150,
    chef: 'chef_c',
    variants: [
      { id: 'mo_veg', name: 'Vegetable', priceModifier: 0 },
      { id: 'mo_paneer', name: 'Paneer', priceModifier: 30 },
    ],
  },

  // WRAPS CATEGORY
  {
    id: 'spicy_wrap',
    name: 'Spicy Wrap',
    category: 'wraps',
    basePrice: 200,
    chef: 'chef_c',
    variants: [
      { id: 'sw_chicken', name: 'Chicken', priceModifier: 0 },
      { id: 'sw_paneer', name: 'Paneer', priceModifier: 20 },
    ],
  },
  {
    id: 'normal_wrap',
    name: 'Normal Wrap',
    category: 'wraps',
    basePrice: 180,
    chef: 'chef_c',
    variants: [
      { id: 'nw_chicken', name: 'Chicken', priceModifier: 0 },
      { id: 'nw_veg', name: 'Vegetable', priceModifier: -30 },
    ],
  },
  {
    id: 'cheese_cone',
    name: 'Cheese Cone',
    category: 'wraps',
    basePrice: 220,
    chef: 'chef_c',
    variants: [
      { id: 'cc_regular', name: 'Regular', priceModifier: 0 },
      { id: 'cc_spicy', name: 'Spicy', priceModifier: 10 },
    ],
  },
];

/** Table numbers available in the cafe */
export const TABLE_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Menu categories for UI display */
export const MENU_CATEGORIES = [
  { id: 'tea', label: 'Tea' },
  { id: 'cold_drinks', label: 'Cold Drinks' },
  { id: 'starters', label: 'Starters' },
  { id: 'wraps', label: 'Wraps' },
];

/** Chef information */
export const CHEF_INFO = {
  chef_a: {
    name: 'Chef A',
    specialty: 'Tea Maker',
    color: '#FF6B6B',
  },
  chef_b: {
    name: 'Chef B',
    specialty: 'Drinks & Snacks',
    color: '#4ECDC4',
  },
  chef_c: {
    name: 'Chef C',
    specialty: 'Wraps & Specials',
    color: '#FFE66D',
  },
};

/** Status colors for UI */
export const STATUS_COLORS = {
  pending: '#888888',
  preparing: '#FF9500',
  ready: '#34C759',
  served: '#5AC8FA',
};

/** Helper function to get menu items by category */
export const getMenuItemsByCategory = (category: string) => {
  return MENU_ITEMS.filter((item) => item.category === category);
};

/** Helper function to get all items for a specific chef */
export const getItemsForChef = (chefRole: string) => {
  return MENU_ITEMS.filter((item) => item.chef === chefRole);
};
