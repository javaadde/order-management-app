import { create } from 'zustand';
import { Order, OrderItem, UserRole, ChefRole, OrderStatus, ItemStatus } from '../types';
import { MENU_ITEMS } from '../constants/menu';
import { deleteCloudOrder, publishOrder } from '../services/orderSync';
import { sendRealtimeNotification } from '../services/notificationSocket';
import { generateId } from '../utils/helpers';

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

function getTableLabel(tableNumber: number) {
  return `Table (${TABLE_NAMES[tableNumber] ?? tableNumber})`;
}

interface CafeFlowStore {
  // State
  currentRole: UserRole | null;
  currentTableNumber: number | null;
  allOrders: Order[];
  tempCartItems: OrderItem[];
  theme: 'light' | 'dark';

  // Servant actions
  setRole: (role: UserRole | null) => void;
  selectTable: (tableNumber: number) => void;
  addItemToCart: (menuItemId: string, variantId: string, quantity: number) => void;
  removeItemFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  submitOrder: () => Order | null;
  clearCart: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Chef actions
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  markOrderAsServed: (orderId: string) => void;

  // Order management
  getOrdersForChef: (chefRole: ChefRole) => Order[];
  getOrdersForTable: (tableNumber: number) => Order[];
  getAllPendingOrders: () => Order[];
  deleteOrder: (orderId: string) => void;
  clearCompletedOrders: () => void;
  setOrders: (orders: Order[]) => void;
  upsertOrder: (order: Order) => void;
  removeSyncedOrder: (orderId: string) => void;

  // Utility
  getCartTotal: () => number;
  getOrderStatus: (orderId: string) => OrderStatus;
}

/**
 * CafeFlow Zustand Store
 * Manages all state for the order management system
 * Real-time updates shared across servant and chef panels
 */
export const useCafeFlowStore = create<CafeFlowStore>((set, get) => ({
  // Initial state
  currentRole: null,
  currentTableNumber: null,
  allOrders: [],
  tempCartItems: [],
  theme: 'light',

  // Servant action: Set user role
  setRole: (role: UserRole | null) => {
    set({ currentRole: role });
    if (role !== 'servant') {
      set({ currentTableNumber: null });
    }
  },

  // Servant action: Select table
  selectTable: (tableNumber: number) => {
    set({ currentTableNumber: tableNumber });
  },

  // Servant action: Add item to cart
  addItemToCart: (menuItemId: string, variantId: string, quantity: number) => {
    const menuItem = MENU_ITEMS.find((m) => m.id === menuItemId);
    if (!menuItem) return;

    const variant = menuItem.variants.find((v) => v.id === variantId);
    if (!variant) return;

    const pricePerUnit = menuItem.basePrice + variant.priceModifier;

    const newItem: OrderItem = {
      id: generateId(),
      menuItemId,
      menuItemName: menuItem.name,
      variantId,
      variantName: variant.name,
      quantity,
      pricePerUnit,
      totalPrice: pricePerUnit * quantity,
      status: 'pending',
      assignedChef: menuItem.chef,
      createdAt: Date.now(),
    };

    set((state) => ({
      tempCartItems: [...state.tempCartItems, newItem],
    }));
  },

  // Servant action: Remove item from cart
  removeItemFromCart: (cartItemId: string) => {
    set((state) => ({
      tempCartItems: state.tempCartItems.filter((item) => item.id !== cartItemId),
    }));
  },

  // Servant action: Update item quantity in cart
  updateCartItemQuantity: (cartItemId: string, quantity: number) => {
    set((state) => ({
      tempCartItems: state.tempCartItems.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity,
              totalPrice: item.pricePerUnit * quantity,
            }
          : item
      ),
    }));
  },

  // Servant action: Submit order
  submitOrder: () => {
    const state = get();
    if (!state.currentTableNumber || state.tempCartItems.length === 0) return null;

    const totalPrice = state.tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const newOrder: Order = {
      id: generateId(),
      tableNumber: state.currentTableNumber,
      items: state.tempCartItems,
      status: 'pending',
      totalPrice,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      allOrders: [...state.allOrders, newOrder],
      tempCartItems: [],
    }));

    (['chef_a', 'chef_b', 'chef_c'] as const).forEach((chefRole) => {
      const assignedItems = newOrder.items.filter((item) => item.assignedChef === chefRole);
      if (assignedItems.length === 0) return;

      sendRealtimeNotification({
        target: chefRole,
        title: chefRole === 'chef_a' ? 'New tea order' : 'New kitchen order',
        message: `${getTableLabel(newOrder.tableNumber)} sent ${assignedItems.length} ${chefRole === 'chef_a' ? 'tea' : 'kitchen'} item${assignedItems.length === 1 ? '' : 's'}`,
        important: true,
      });
    });

    void publishOrder(newOrder).catch(() => {
      // Order stays on this device if the daily server is temporarily unavailable.
    });

    return newOrder;
  },

  // Theme action
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
  },

  // Servant action: Clear cart
  clearCart: () => {
    set({ tempCartItems: [] });
  },

  // Chef action: Update item status
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => {
    const currentOrder = get().allOrders.find((order) => order.id === orderId);
    const currentItem = currentOrder?.items.find((item) => item.id === itemId);

    set((state) => ({
      allOrders: state.allOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      status,
                      readyAt: status === 'ready' ? Date.now() : item.readyAt,
                    }
                  : item
              ),
              updatedAt: Date.now(),
            }
          : order
      ),
    }));

    if (currentOrder && currentItem && currentItem.status !== status) {
      if (status === 'preparing') {
        sendRealtimeNotification({
          target: 'servant',
          title: 'Order started',
          message: `${currentItem.menuItemName} started for ${getTableLabel(currentOrder.tableNumber)}`,
          important: false,
        });
      }

      if (status === 'ready') {
        const updatedOrder = get().allOrders.find((order) => order.id === orderId);
        const allReady = updatedOrder?.items.every((item) => item.status === 'ready');

        sendRealtimeNotification({
          target: 'servant',
          title: allReady ? 'Order ready for pickup' : 'Item ready',
          message: allReady
            ? `${getTableLabel(currentOrder.tableNumber)} is ready for pickup`
            : `${currentItem.menuItemName} is ready for ${getTableLabel(currentOrder.tableNumber)}`,
          important: true,
        });
      }

      const updatedOrder = get().allOrders.find((order) => order.id === orderId);
      if (updatedOrder) {
        void publishOrder(updatedOrder).catch(() => {
          // Status stays local if the daily server is temporarily unavailable.
        });
      }
    }
  },

  // Chef action: Mark order as served
  markOrderAsServed: (orderId: string) => {
    const servedOrder = get().allOrders.find((order) => order.id === orderId);

    set((state) => ({
      allOrders: state.allOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'served' as OrderStatus,
              completedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : order
      ),
    }));

    if (servedOrder) {
      const updatedOrder = get().allOrders.find((order) => order.id === orderId);
      if (updatedOrder) {
        void publishOrder(updatedOrder).catch(() => {
          // Served status stays local if the daily server is temporarily unavailable.
        });
      }

      sendRealtimeNotification({
        target: 'all',
        title: 'Order served',
        message: `${getTableLabel(servedOrder.tableNumber)} was served and is ready for billing`,
        important: true,
      });
    }
  },

  // Query: Get orders for a specific chef
  getOrdersForChef: (chefRole: ChefRole) => {
    const state = get();
    return state.allOrders.filter((order) =>
      order.items.some((item) => item.assignedChef === chefRole)
    );
  },

  // Query: Get orders for a specific table
  getOrdersForTable: (tableNumber: number) => {
    const state = get();
    return state.allOrders.filter((order) => order.tableNumber === tableNumber);
  },

  // Query: Get all pending orders
  getAllPendingOrders: () => {
    const state = get();
    return state.allOrders.filter((order) => order.status !== 'served');
  },

  // Utility: Delete order
  deleteOrder: (orderId: string) => {
    const deletedOrder = get().allOrders.find((order) => order.id === orderId);

    set((state) => ({
      allOrders: state.allOrders.filter((order) => order.id !== orderId),
    }));

    if (deletedOrder) {
      void deleteCloudOrder(orderId).catch(() => {
        // Deletion stays local if the daily server is temporarily unavailable.
      });

      sendRealtimeNotification({
        target: 'all',
        title: 'Bill completed',
        message: `${getTableLabel(deletedOrder.tableNumber)} is now free`,
        important: true,
      });
    }
  },

  // Utility: Clear completed orders
  clearCompletedOrders: () => {
    set((state) => ({
      allOrders: state.allOrders.filter((order) => order.status !== 'served'),
    }));
  },

  setOrders: (orders: Order[]) => {
    set({ allOrders: orders });
  },

  upsertOrder: (order: Order) => {
    set((state) => {
      const exists = state.allOrders.some((item) => item.id === order.id);

      return {
        allOrders: exists
          ? state.allOrders.map((item) => (item.id === order.id ? order : item))
          : [...state.allOrders, order],
      };
    });
  },

  removeSyncedOrder: (orderId: string) => {
    set((state) => ({
      allOrders: state.allOrders.filter((order) => order.id !== orderId),
    }));
  },

  // Utility: Get cart total
  getCartTotal: () => {
    const state = get();
    return state.tempCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  // Utility: Calculate order status based on items
  getOrderStatus: (orderId: string): OrderStatus => {
    const state = get();
    const order = state.allOrders.find((o) => o.id === orderId);
    if (!order) return 'pending';

    const allReady = order.items.every((item) => item.status === 'ready');
    const someReady = order.items.some((item) => item.status === 'ready');

    if (allReady) return 'ready';
    if (someReady) return 'partially_ready';
    return 'pending';
  },
}));
