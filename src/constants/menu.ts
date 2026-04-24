import { MenuItem } from '../types';

/**
 * Menu items database updated with user specific requirements
 */
export const MENU_ITEMS: MenuItem[] = [
  // TEA CATEGORY - Directed to TEA-MAKER (Chef A)
  {
    id: 'black_tea',
    name: 'Black Tea',
    category: 'tea',
    basePrice: 50,
    chef: 'chef_a',
    variants: [
      { id: 'bt_classic', name: 'Classic Black', priceModifier: 0 },
      { id: 'bt_lemon', name: 'Lemon Black', priceModifier: 10 },
      { id: 'bt_ginger', name: 'Ginger Tea', priceModifier: 15 },
      { id: 'bt_masala', name: 'Masala Black', priceModifier: 15 },
      { id: 'bt_mint', name: 'Mint Black', priceModifier: 10 },
    ],
  },
  {
    id: 'milk_tea',
    name: 'Milk Tea',
    category: 'tea',
    basePrice: 70,
    chef: 'chef_a',
    variants: [
      { id: 'mt_homely', name: 'Homely Milk Tea', priceModifier: 0 },
      { id: 'mt_cardamom', name: 'Cardamom Milk', priceModifier: 10 },
      { id: 'mt_strong', name: 'Strong Kadak', priceModifier: 15 },
      { id: 'mt_saffron', name: 'Saffron Milk', priceModifier: 30 },
    ],
  },
  {
    id: 'healthy_tea',
    name: 'Healthy Tea',
    category: 'tea',
    basePrice: 90,
    chef: 'chef_a',
    variants: [
      { id: 'ht_green', name: 'Green Tea', priceModifier: 0 },
      { id: 'ht_hibiscus', name: 'Hibiscus Tea', priceModifier: 20 },
      { id: 'ht_chamomile', name: 'Chamomile', priceModifier: 30 },
      { id: 'ht_detox', name: 'Detox Blend', priceModifier: 40 },
    ],
  },

  // LIMES CATEGORY - Directed to Chef B
  {
    id: 'lime_fresh',
    name: 'Fresh Lime',
    category: 'cold_drinks',
    basePrice: 60,
    chef: 'chef_b',
    image: require('../../assets/images/limes/fresh.jpg'),
    variants: [{ id: 'l_fresh', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'lime_mint',
    name: 'Mint Lime',
    category: 'cold_drinks',
    basePrice: 70,
    chef: 'chef_b',
    image: require('../../assets/images/limes/mint.jpg'),
    variants: [{ id: 'l_mint', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'lime_ginger',
    name: 'Ginger Lime',
    category: 'cold_drinks',
    basePrice: 75,
    chef: 'chef_b',
    image: require('../../assets/images/limes/ginger.jpg'),
    variants: [{ id: 'l_ginger', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'lime_blue',
    name: 'Blue Lime',
    category: 'cold_drinks',
    basePrice: 80,
    chef: 'chef_b',
    image: require('../../assets/images/limes/blue.jpg'),
    variants: [{ id: 'l_blue', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'lime_grape',
    name: 'Grape Lime',
    category: 'cold_drinks',
    basePrice: 85,
    chef: 'chef_b',
    image: require('../../assets/images/limes/grape.jpg'),
    variants: [{ id: 'l_grape', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'lime_pinaple',
    name: 'Pineapple Lime',
    category: 'cold_drinks',
    basePrice: 85,
    chef: 'chef_b',
    image: require('../../assets/images/limes/pinaple.jpg'),
    variants: [{ id: 'l_pinaple', name: 'Standard', priceModifier: 0 }],
  },

  // MOJITOS CATEGORY - Directed to Chef B
  {
    id: 'mojito_orange',
    name: 'Orange Mojito',
    category: 'cold_drinks',
    basePrice: 140,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/orange.jpg'),
    variants: [{ id: 'm_orange', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'mojito_passion',
    name: 'Passion Fruit Mojito',
    category: 'cold_drinks',
    basePrice: 150,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/passionFruit.jpg'),
    variants: [{ id: 'm_passion', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'mojito_pinaple',
    name: 'Pineapple Mojito',
    category: 'cold_drinks',
    basePrice: 145,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/pinaple.jpg'),
    variants: [{ id: 'm_pinaple', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'mojito_watermelon',
    name: 'Watermelon Mojito',
    category: 'cold_drinks',
    basePrice: 145,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/watermelon.jpg'),
    variants: [{ id: 'm_watermelon', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'mojito_apple',
    name: 'Green Apple Mojito',
    category: 'cold_drinks',
    basePrice: 150,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/greenApple.jpg'),
    variants: [{ id: 'm_apple', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'mojito_blue',
    name: 'Blue Lagoon Mojito',
    category: 'cold_drinks',
    basePrice: 140,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/blue.jpg'),
    variants: [{ id: 'm_blue', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'mojito_litchi',
    name: 'Litchi Mojito',
    category: 'cold_drinks',
    basePrice: 150,
    chef: 'chef_b',
    image: require('../../assets/images/mojitos/litchi.jpg'),
    variants: [{ id: 'm_litchi', name: 'Standard', priceModifier: 0 }],
  },

  // SODA CATEGORY - Directed to Chef B
  {
    id: 'soda_pinaple',
    name: 'Pineapple Soda',
    category: 'cold_drinks',
    basePrice: 65,
    chef: 'chef_b',
    image: require('../../assets/images/soda/pinaple.jpg'),
    variants: [{ id: 's_pinaple', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'soda_chilli',
    name: 'Chilli Soda',
    category: 'cold_drinks',
    basePrice: 60,
    chef: 'chef_b',
    image: require('../../assets/images/soda/chilli.jpg'),
    variants: [{ id: 's_chilli', name: 'Standard', priceModifier: 0 }],
  },
  {
    id: 'soda_grape',
    name: 'Grape Soda',
    category: 'cold_drinks',
    basePrice: 65,
    chef: 'chef_b',
    image: require('../../assets/images/soda/grape.jpg'),
    variants: [{ id: 's_grape', name: 'Standard', priceModifier: 0 }],
  },

  // STARTERS CATEGORY - Directed to Chef B (except momos)
  {
    id: 'french_fries',
    name: 'Normal Fries',
    category: 'starters',
    basePrice: 100,
    chef: 'chef_b',
    image: require('../../assets/images/starters/normalFries.jpg'),
    variants: [{ id: 'ff_reg', name: 'Classic Regular', priceModifier: 0 }],
  },
  {
    id: 'peri_peri_fries',
    name: 'Peri Fries',
    category: 'starters',
    basePrice: 120,
    chef: 'chef_b',
    image: require('../../assets/images/starters/periFries.jpg'),
    variants: [{ id: 'pp_reg', name: 'Spicy peri peri', priceModifier: 0 }],
  },
  {
    id: 'nuggets',
    name: 'Nuggets',
    category: 'starters',
    basePrice: 150,
    chef: 'chef_b',
    image: require('../../assets/images/starters/nuggets.jpg'),
    variants: [{ id: 'n_reg', name: 'Crispy Nuggets', priceModifier: 0 }],
  },
  {
    id: 'momos',
    name: 'Momos',
    category: 'starters',
    basePrice: 130,
    chef: 'chef_c', // Momos go to Chef C
    image: require('../../assets/images/starters/momos.jpg'),
    variants: [
      { id: 'mo_veg', name: 'Veg Fried', priceModifier: 0 },
      { id: 'mo_chicken', name: 'Chicken Fried', priceModifier: 30 },
    ],
  },

  // WRAPS CATEGORY - Directed to Chef C
  {
    id: 'spicy_wrap',
    name: 'Spicy Wrap',
    category: 'wraps',
    basePrice: 180,
    chef: 'chef_c',
    variants: [{ id: 'sw_reg', name: 'Hot n Spicy', priceModifier: 0 }],
  },
  {
    id: 'normal_wrap',
    name: 'Normal Wrap',
    category: 'wraps',
    basePrice: 160,
    chef: 'chef_c',
    variants: [{ id: 'nw_reg', name: 'Classic Wrap', priceModifier: 0 }],
  },
  {
    id: 'cheese_cone',
    name: 'Cheese Cone',
    category: 'wraps',
    basePrice: 140,
    chef: 'chef_c',
    variants: [{ id: 'cc_reg', name: 'Melty Cheese', priceModifier: 0 }],
  },
];

/** Table numbers available in the cafe */
export const TABLE_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Menu categories for UI display */
export const MENU_CATEGORIES = [
  { id: 'tea', label: 'Teas' },
  { id: 'cold_drinks', label: 'Drinks' },
  { id: 'starters', label: 'Starters' },
  { id: 'wraps', label: 'Wraps' },
];

/** Chef information */
export const CHEF_INFO = {
  chef_a: {
    name: 'Shigin',
    specialty: 'Tea Maker',
    color: '#059669', // Emerald
  },
  chef_b: {
    name: 'Swadiq',
    specialty: 'Drinks & Snacks',
    color: '#3B82F6', // Blue
  },
  chef_c: {
    name: 'Jaslin',
    specialty: 'Wraps, Momos & Specials',
    color: '#F59E0B', // Amber
  },
};

/** Status colors for UI */
export const STATUS_COLORS = {
  pending: '#94A3B8', // Slate
  preparing: '#F59E0B', // Amber
  ready: '#10B981', // Emerald
  served: '#6366F1', // Indigo
};

/** Helper function to get menu items by category */
export const getMenuItemsByCategory = (category: string) => {
  return MENU_ITEMS.filter((item) => item.category === category);
};

/** Helper function to get all items for a specific chef */
export const getItemsForChef = (chefRole: string) => {
  return MENU_ITEMS.filter((item) => item.chef === chefRole);
};
