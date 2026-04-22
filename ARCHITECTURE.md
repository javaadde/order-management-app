# CafeFlow Architecture Guide

## System Overview

CafeFlow is a real-time order management system for cafes/hotels with:
- **Servant Panel**: Order placement from tables
- **Chef Panels**: Real-time order preparation with automatic assignment

## Technology Stack

```
┌─────────────────────────────────────────┐
│         CafeFlow Application            │
├─────────────────────────────────────────┤
│  React Native + TypeScript + Expo       │
├─────────────────────────────────────────┤
│         Expo Router (Navigation)        │
├─────────────────────────────────────────┤
│       Zustand (State Management)        │
├─────────────────────────────────────────┤
│     React Native StyleSheet (UI)        │
└─────────────────────────────────────────┘
```

## Folder Structure Deep Dive

### `/app` - Routing Layer (Expo Router)
File-based routing following Expo conventions:

```
app/
├── _layout.tsx           # Root layout with Stack navigator
├── index.tsx             # Role selection screen
├── servant/
│   ├── index.tsx         # Dashboard (tables, orders, cart)
│   ├── menu.tsx          # Menu browsing with variants
│   └── order-summary.tsx # Order confirmation
└── chef/
    └── [role].tsx        # Dynamic chef panel (chef_a, b, c)
```

**File-based routing means:**
- URL `/` → `app/index.tsx`
- URL `/servant` → `app/servant/index.tsx`
- URL `/servant/menu` → `app/servant/menu.tsx`
- URL `/chef/chef_a` → `app/chef/[role].tsx` with params

### `/src` - Application Logic Layer

#### `/src/store/cafeFlow.ts` - Core State Management
Heart of the application. Zustand store handling:

```typescript
interface CafeFlowStore {
  // STATE
  currentRole: UserRole | null
  currentTableNumber: number | null
  allOrders: Order[]
  tempCartItems: OrderItem[]

  // SERVANT ACTIONS
  setRole(role)
  selectTable(tableNumber)
  addItemToCart(menuItemId, variantId, quantity)
  submitOrder()
  clearCart()

  // CHEF ACTIONS
  updateItemStatus(orderId, itemId, status)

  // QUERIES
  getOrdersForChef(chefRole)
  getOrdersForTable(tableNumber)
}
```

**Why Zustand?**
- Simple, lightweight state management
- No boilerplate like Redux
- Automatic component subscription
- Easy to track state changes
- Real-time updates to subscribed components

#### `/src/types/index.ts` - Type Definitions
Complete TypeScript interfaces:

```typescript
UserRole = 'servant' | 'chef_a' | 'chef_b' | 'chef_c'
ItemStatus = 'pending' | 'preparing' | 'ready'
OrderStatus = 'pending' | 'partially_ready' | 'ready' | 'served'

MenuItem {
  id, name, category, basePrice, chef, variants[]
}

OrderItem {
  id, menuItemId, quantity, pricePerUnit, status, etc
}

Order {
  id, tableNumber, items[], totalPrice, status
}
```

#### `/src/constants/menu.ts` - Menu Database
Menu items database (ready to replace with API):

```typescript
const MENU_ITEMS = [
  {
    id: 'black_tea',
    name: 'Black Tea',
    category: 'tea',          // Routes to category
    basePrice: 80,
    chef: 'chef_a',           // Smart assignment
    variants: [
      { id: 'bt_normal', name: 'Normal', priceModifier: 0 },
      { id: 'bt_lemon', name: 'Lemon', priceModifier: 10 }
    ]
  },
  // ... more items
]

const TABLE_NUMBERS = [1, 2, 3, ..., 12]
const MENU_CATEGORIES = ['tea', 'cold_drinks', 'starters', 'wraps']
const CHEF_INFO = { chef_a: {...}, chef_b: {...}, ... }
```

#### `/src/components/UIComponents.tsx` - Reusable Components
Touch-friendly POS-style components:

```typescript
<Button variant="primary|secondary|danger|success" size="small|medium|large" />
<Card> {children} </Card>
<Badge label="5" color="#FF3B30" />
<SectionHeader title="Title" subtitle="Subtitle" />
<QuantitySelector quantity={1} onIncrease={} onDecrease={} />
<OrderItemCard itemName="" variantName="" status="pending" />
```

#### `/src/utils/helpers.ts` - Utilities
Helper functions:

```typescript
generateId()              // Unique ID generation
formatCurrency(amount)    // ₹ formatting
formatTime(timestamp)     // Time display
getStatusColor(status)    // Color mapping
debounce(func, wait)      // Rate limiting
```

## Data Flow Architecture

### Order Submission Flow (Servant)

```
User selects item
        ↓
Modal with variants
        ↓
User chooses variant + quantity
        ↓
addItemToCart(menuItemId, variantId, qty)
        ↓
tempCartItems[] updated in Zustand
        ↓
Cart UI re-renders (subscribed to store)
        ↓
User submits order
        ↓
submitOrder() called
        ↓
New Order object created with:
  - Table number
  - All items with their assigned chefs
  - Total price
  - Timestamp
        ↓
Added to allOrders[] in store
        ↓
All subscribed components re-render
        ↓
Chef panels instantly see new orders
```

### Order Preparation Flow (Chef)

```
New order arrives in allOrders[]
        ↓
getOrdersForChef(chefRole) filters orders
        ↓
Items for this chef displayed as "Pending"
        ↓
Chef selects "Start Preparing"
        ↓
updateItemStatus(orderId, itemId, 'preparing')
        ↓
Zustand updates allOrders[].items[]
        ↓
Item UI changes to orange
        ↓
Chef marks item as "Ready"
        ↓
updateItemStatus(orderId, itemId, 'ready')
        ↓
Zustand updates store
        ↓
Servant panel sees order status update
        ↓
All other chefs' panels unaffected
```

## Component Hierarchy

### Servant Panel Tree

```
ServantPanel (index.tsx)
├── Header
│   └── Logout button
├── Tab Navigation
│   ├── Tables tab
│   ├── Orders tab
│   └── Cart tab
├── Content (conditional)
│   ├── Tables view
│   │   └── TableCard x12 (grid)
│   ├── Orders view
│   │   └── Card
│   │       ├── Order info
│   │       └── Badge (status)
│   └── Cart view
│       └── CartItem x N
└── Bottom action bar
    └── Button "Take Order"
```

### Menu Screen Tree

```
MenuScreen (menu.tsx)
├── Header
│   ├── Back button
│   └── Cart badge
├── Category filters (horizontal scroll)
│   └── CategoryButton x 4
├── Menu items list
│   └── ItemCard x N
│       ├── Item name
│       ├── Variants count
│       └── Price
├── Cart bar (bottom)
│   ├── Item count
│   └── "Review Order" button
└── Variant Modal (when item selected)
    ├── Item name
    ├── Variant options (radio)
    ├── Quantity selector
    ├── Price breakdown
    └── Buttons (Add/Cancel)
```

### Chef Panel Tree

```
ChefPanel (chef/[role].tsx)
├── Header
│   ├── Chef name
│   └── Logout
├── Tab Navigation
│   ├── Pending tab
│   ├── Preparing tab
│   └── Ready tab
├── Content
│   └── Order x N (for tab)
│       ├── Order header
│       │   ├── Table number
│       │   └── Time
│       ├── OrderItemCard x N
│       │   ├── Item name
│       │   ├── Variant
│       │   └── Status (clickable)
│       └── Action button
│           ├── "Start Preparing"
│           └── "Mark All Ready"
└── Stats bar (bottom)
    ├── Pending count
    ├── Preparing count
    └── Ready count
```

## State Management Details

### Store Structure

```json
{
  "currentRole": "servant|chef_a|chef_b|chef_c|null",
  "currentTableNumber": "1|2|...|12|null",
  "tempCartItems": [
    {
      "id": "unique_id",
      "menuItemId": "black_tea",
      "menuItemName": "Black Tea",
      "variantId": "bt_lemon",
      "variantName": "Lemon",
      "quantity": 2,
      "pricePerUnit": 90,
      "totalPrice": 180,
      "status": "pending",
      "assignedChef": "chef_a",
      "createdAt": 1713787200000
    }
  ],
  "allOrders": [
    {
      "id": "order_123456",
      "tableNumber": 1,
      "items": [ /* OrderItems */ ],
      "status": "pending|partially_ready|ready|served",
      "totalPrice": 500,
      "createdAt": 1713787200000,
      "updatedAt": 1713787200000,
      "completedAt": null
    }
  ]
}
```

## Smart Order Distribution Logic

### Auto-Assignment System

When order submitted, items routed to chefs by category:

```typescript
const CHEF_ROUTES = {
  'tea': 'chef_a',
  'cold_drinks': 'chef_b',
  'starters': 'chef_b',
  'wraps': 'chef_c',
  'momos': 'chef_c', (exception)
}

// When adding item:
const menuItem = MENU_ITEMS.find(m => m.id === menuItemId)
const item = {
  ...
  assignedChef: menuItem.chef  // Already set!
}
```

### Query Filtering

Chiefs only see their own items:

```typescript
getOrdersForChef(chefRole) filters by:
  allOrders
    .filter(order => order.items.some(
      item => item.assignedChef === chefRole
    ))
    .map(order => ({
      // Order has all items, but chef displays only theirs
      items: order.items.filter(
        item => item.assignedChef === chefRole
      )
    }))
```

## UI/UX Design Patterns

### Status Color Coding
- **Gray (#888)**: Not started - awaiting action
- **Orange (#FF9500)**: In progress - active work
- **Green (#34C759)**: Complete - ready for next step
- **Blue (#007AFF)**: Interactive - clickable elements

### Touch-Friendly Sizes
- Minimum tap target: 44x44 points
- Button padding: 12-16px vertical
- Card margins: 8px for easy swiping
- Text sizes: 14-22px for readability

### Real-Time Indication
- Status badges update on tap
- Tab badges show live counts
- Stats bar updates instantly
- No loading screens (instant Zustand updates)

## Extensibility Points

### 1. Add More Menu Items
Edit `src/constants/menu.ts`:
```typescript
MENU_ITEMS.push({
  id: 'new_item',
  name: 'New Item',
  category: 'tea',
  basePrice: 120,
  chef: 'chef_a',
  variants: [/* ... */]
})
```

### 2. Add New Chef Category
Add new category and route it:
```typescript
// constants/menu.ts
MENU_CATEGORIES.push({ id: 'new_category', label: 'New' })

// menu-database
chef_assignment['new_category'] = 'chef_new'
```

### 3. Connect to Backend
Replace Zustand actions:
```typescript
submitOrder: async () => {
  const res = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  })
  return res.json()
}
```

### 4. Add Authentication
Wrap app in auth context:
```typescript
<AuthContext>
  <RootLayout />
</AuthContext>
```

### 5. Add Notifications
Hook into status updates:
```typescript
// Subscribe to order updates
useCafeFlowStore.subscribe(
  (state) => state.allOrders,
  (orders) => showNotification()
)
```

## Performance Considerations

### Optimization Strategies
1. **Zustand Selectors**: Only subscribe to needed state
   ```typescript
   const orders = useCafeFlowStore((s) => s.allOrders)
   ```

2. **Memoization**: Prevent unnecessary re-renders
   ```typescript
   const filteredOrders = useMemo(() => {...}, [deps])
   ```

3. **Lazy Rendering**: Use FlatList for long lists
   ```typescript
   <FlatList data={items} renderItem={} />
   ```

## Testing Strategy

### Unit Testing (Jest)
```typescript
// Test store actions
test('addItemToCart adds item to tempCartItems', () => {
  const store = useCafeFlowStore.getState()
  store.addItemToCart('black_tea', 'bt_normal', 1)
  expect(store.tempCartItems).toHaveLength(1)
})
```

### Integration Testing
- Simulate servant flow: select item → submit → chef sees it
- Verify chef updates propagate to servant
- Check status transitions

### Manual Testing Scenarios
1. ✅ Servant workflow (in QUICKSTART.md)
2. ✅ Chef workflow
3. ✅ Real-time updates across devices
4. ✅ Multiple orders simulation
5. ✅ Wrong role assignment (should not see items)

## Summary

CafeFlow is built on:
- **Zustand** for bulletproof real-time state
- **Expo Router** for clean, file-based navigation
- **TypeScript** for type safety
- **React Native** for cross-platform compatibility
- **Modular architecture** for easy scaling

All components are isolated, testable, and easy to extend. The app is ready for backend integration while functioning perfectly offline.
