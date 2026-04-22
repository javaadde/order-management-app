# CafeFlow - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### 1. Install Dependencies
```bash
cd /home/javaadde/Projects/the-black-tea
npm install --legacy-peer-deps
```

### 2. Start the App
```bash
npm start
```

### 3. Choose Platform
- Press `a` for Android
- Press `i` for iOS  
- Press `w` for Web

## 🎯 Test the App

### Test Scenario 1: Order Taking (Servant)
1. Select "Servant / Waiter" on role screen
2. Select "Table 1"
3. Click "Take Order for Table"
4. Browse "Tea" category, select "Black Tea"
5. Choose variant "Lemon" (₹90)
6. Set quantity to 2
7. Click "Add to Cart"
8. Click "Review & Submit Order"
9. Confirm all items
10. Click "Submit to Kitchen"

### Test Scenario 2: Prepare Order (Chef)
1. Select "Chef A" (Tea Maker) on role screen
2. You should see the Black Tea order in "Pending"
3. Click "Start Preparing"
4. Items turn orange (Preparing status)
5. Click items to mark as "Ready"
6. Items turn green
7. Statistics update in real-time

### Test Scenario 3: Check Real-Time Updates
1. Keep Chef A panel open
2. Open Servant panel in different terminal/device
3. Submit another order
4. Watch Chef panel update instantly

## 📱 Core Workflows

### Servant Panel Flow
```
Role Selection → Select Table → Browse Menu → 
Add Items → Review Order → Submit to Kitchen
```

### Chef Panel Flow
```
Role Selection → View Orders → Start Preparing →
Mark Items Ready → View Statistics
```

## 🎨 UI Quick Reference

### Colors
- **Gray**: Pending items (not started)
- **Orange**: Items being prepared
- **Green**: Ready items (completed)
- **Blue**: Primary actions/buttons

### Navigation
- Back buttons on all screens for navigation
- Tab systems for different views
- Bottom action bars for quick access

## 🔧 Customization

### Add New Menu Item
Edit `src/constants/menu.ts`:
```typescript
{
  id: 'new_item_id',
  name: 'New Item',
  category: 'tea',  // or cold_drinks, starters, wraps
  basePrice: 100,
  chef: 'chef_a',   // who prepares it
  variants: [
    { id: 'variant_1', name: 'Option 1', priceModifier: 0 },
    { id: 'variant_2', name: 'Option 2', priceModifier: 20 }
  ]
}
```

### Change Chef Assignment
In same file, set the `chef` field to:
- `'chef_a'` - Tea Maker
- `'chef_b'` - Drinks & Snacks
- `'chef_c'` - Wraps & Specials

### Modify Colors
Edit component style or use `STATUS_COLORS` in `src/constants/menu.ts`

## 📊 Data Flow

```
Servant App                    Zustand Store                  Chef App
   ↓                               ↓                             ↓
Select Item          →      addItemToCart()      ↔      Subscribed to store
   ↓                               ↓                             ↓
Submit Order         →      submitOrder()        ↔      getOrdersForChef()
   ↓                               ↓                             ↓
See in cart          ←      tempCartItems        ←      Display pending
                                  ↓                             ↓
                           allOrders []          →      View order details
                               ↓                            ↓
                         Update item status      →      updateItemStatus()
                               ↓                            ↓
                        Order status changes     ←      Instant update
```

## 🐛 Debugging

### Check if Store is Updating
Add to any component:
```typescript
const allOrders = useCafeFlowStore((state) => state.allOrders);
console.log('Current orders:', allOrders);
```

### Check Current Role
```typescript
const currentRole = useCafeFlowStore((state) => state.currentRole);
console.log('Current role:', currentRole);
```

### Reset State
The store resets on app reload since it uses memory storage.

## 📝 File Reference

| What | Where |
|------|-------|
| Menu data | `src/constants/menu.ts` |
| App state | `src/store/cafeFlow.ts` |
| Type definitions | `src/types/index.ts` |
| UI components | `src/components/UIComponents.tsx` |
| Helper functions | `src/utils/helpers.ts` |
| Role selection | `app/index.tsx` |
| Servant dashboard | `app/servant/index.tsx` |
| Chef dashboard | `app/chef/[role].tsx` |

## ⚡ Key Features Implemented

✅ Multi-role system (Servant + 3 Chefs)
✅ Category-based menu with variants
✅ Real-time order updates across panels
✅ Automatic chef assignment
✅ Order status tracking
✅ Touch-friendly POS-style UI
✅ No backend required (ready for API integration)
✅ Complete TypeScript type safety

## 🔌 Backend Integration (Future)

To connect to a backend API:

1. In `src/store/cafeFlow.ts`, replace Zustand actions with async functions:
```typescript
submitOrder: async () => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(newOrder)
  });
  return response.json();
}
```

2. Replace menu data fetch with API call:
```typescript
const menuItems = await fetch('/api/menu').then(r => r.json());
```

3. Use WebSocket for real-time updates:
```typescript
const ws = new WebSocket('ws://server/orders');
ws.onmessage = (msg) => updateOrder(JSON.parse(msg.data));
```

## 📚 Additional Resources

- React Native Docs: https://reactnative.dev/
- Expo Docs: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/routing/
- Zustand: https://github.com/pmndrs/zustand

## 🆘 Troubleshooting

**App won't start**: Run `npm install --legacy-peer-deps` again

**TypeScript errors**: Check that all imports use correct paths from `/src`

**Styling looks off**: Ensure safe-area-context and screens are installed

**Real-time not working**: Zustand subscriptions are automatic, check component re-renders

## 📞 Support

For issues or questions, check:
1. Console errors in Expo dev server
2. TypeScript type errors
3. Component import paths
4. Zustand store initialization

---

**Ready to code! Happy cafes!** ☕
