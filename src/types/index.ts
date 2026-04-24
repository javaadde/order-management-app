/** User roles in the CafeFlow system */
export type UserRole = 'servant' | 'chef_a' | 'chef_b' | 'chef_c' | 'admin';

/** Chef specializations */
export type ChefRole = 'chef_a' | 'chef_b' | 'chef_c';

/** Item status in preparation */
export type ItemStatus = 'pending' | 'preparing' | 'ready';

/** Order status */
export type OrderStatus = 'pending' | 'partially_ready' | 'ready' | 'served';

/** Menu categories */
export type MenuCategory = 'tea' | 'cold_drinks' | 'starters' | 'wraps';

/**
 * Menu Item Variant
 * Example: Black Tea has variants like Normal, Lemon, Ginger, etc.
 */
export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  variants: ItemVariant[];
  basePrice: number;
  chef: ChefRole; // Which chef prepares this
  image?: any; // Image source (require/uri)
}

/**
 * Variant of a menu item
 * Example: Normal Black Tea, Lemon Black Tea, etc.
 */
export interface ItemVariant {
  id: string;
  name: string;
  priceModifier: number; // Additional cost over base price
}

/**
 * Order Item - what's actually in an order
 * Combines menu item + variant + quantity
 */
export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  status: ItemStatus;
  assignedChef: ChefRole;
  createdAt: number;
  readyAt?: number;
}

/**
 * Order - complete order from servant
 */
export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

/**
 * Chef's view of an order item
 * Only shows items relevant to that chef
 */
export interface ChefOrderView {
  orderId: string;
  tableNumber: number;
  items: OrderItem[]; // Only items for this chef
  createdAt: number;
}

/**
 * Application state
 */
export interface AppState {
  currentRole: UserRole | null;
  currentTableNumber: number | null;
  selectedTableOrders: Order[];
  allOrders: Order[];
  chefRole?: ChefRole;
}
