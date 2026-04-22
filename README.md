# CafeFlow - Order Management System

A production-ready mobile app for cafe/hotel order management with separate panels for waiters and kitchen chefs.

## Features

### 🍽️ Role-Based System
- **Servant Panel**: Take orders from customers
- **Chef A Panel**: Tea preparation specialist
- **Chef B Panel**: Cold drinks & starters specialist
- **Chef C Panel**: Wraps & specialties specialist

### 📋 Key Features

#### Servant (Waiter) Panel
- Select table number
- Browse menu by categories (Tea, Cold Drinks, Starters, Wraps)
- Select items with variants and quantities
- Review order before submission
- View all pending orders
- Real-time status updates from kitchen

#### Kitchen Chef Panels
- View incoming orders filtered by category
- Filter items by status: Pending → Preparing → Ready
- One-tap status updates
- Real-time order management
- Quick statistics dashboard

### 🔄 Smart Order Distribution
Orders are automatically distributed to the correct chef based on item category:
- **Chef A**: All tea items
- **Chef B**: Cold drinks (Lime, Mojito, Soda) + Starters (Fries, Nuggets)
- **Chef C**: Wraps (Spicy, Normal, Cheese Cone) + Momos

### 💾 State Management
- **Zustand Store**: Real-time state management
- No backend required (works with local state)
- Easy to plug backend API later

## Project Structure

```
/app
  index.tsx              # Role selection screen
  _layout.tsx            # Root layout for Expo Router
  /servant
    index.tsx            # Main servant dashboard
    menu.tsx             # Menu selection with variants
    order-summary.tsx    # Order review & confirmation
  /chef
    [role].tsx           # Dynamic chef panel (chef_a, chef_b, chef_c)

/src
  /store
    cafeFlow.ts          # Zustand store (state management)
    index.ts
  
  /types
    index.ts             # TypeScript interfaces
    index.d.ts
  
  /constants
    menu.ts              # Menu items database
    index.ts
  
  /components
    UIComponents.tsx     # Reusable UI components
    index.ts
  
  /utils
    helpers.ts           # Utility functions
    index.ts
```

## Tech Stack

- **Framework**: React Native + Expo
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: StyleSheet (React Native)

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the Dev Server**
   ```bash
   npm start
   ```

3. **Run on Platforms**
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Usage

### For Servants
1. Open app and select "Servant / Waiter"
2. Select a table number
3. Click "Take Order for Table"
4. Browse menu by categories
5. Select items and variants
6. Add quantity for each item
7. Review order and submit to kitchen

### For Chefs
1. Open app and select your chef role
2. View pending orders in your specialty
3. Click "Start Preparing" to begin work
4. Items turn orange (Preparing)
5. Click items to mark as "Ready"
6. Ready items turn green
7. Stats bar shows real-time counts

## Menu Structure

### Categories

#### Tea (Chef A)
- Black Tea (Normal, Lemon, Ginger, Mint)
- Milk Tea (Normal, Strong, Cardamom)
- Green Tea (Normal, Honey, Jasmine)
- Herbal Tea (Chamomile, Tulsi)

#### Cold Drinks (Chef B)
- Lime (Classic, Mint, Salt, Sweet)
- Mojito (Classic, Blue, Strawberry)
- Soda (Plain, Lemon, Orange)

#### Starters (Chef B)
- French Fries (Regular, Cheese)
- Peri Peri Fries (Mild, Spicy)
- Nuggets (Regular, Spicy)

#### Wraps (Chef C)
- Spicy Wrap (Chicken, Paneer)
- Normal Wrap (Chicken, Veg)
- Cheese Cone (Regular, Spicy)
- Momos (Fried - Veg, Paneer)

## State Management

### Zustand Store (src/store/cafeFlow.ts)

**Key Actions:**
- `setRole(role)` - Set user role
- `selectTable(tableNumber)` - Select current table
- `addItemToCart(menuItemId, variantId, quantity)` - Add item to order
- `submitOrder()` - Submit order to kitchen
- `updateItemStatus(orderId, itemId, status)` - Chef updates item status
- `getOrdersForChef(chefRole)` - Get orders for specific chef
- `getOrdersForTable(tableNumber)` - Get orders for table

## Components

### UIComponents.tsx
- `Button` - Versatile button component
- `Card` - Card container
- `Badge` - Status badges
- `SectionHeader` - Section headers
- `QuantitySelector` - Item quantity control
- `OrderItemCard` - Item display card

## Color Scheme

- **Pending**: Gray (#888888)
- **Preparing**: Orange (#FF9500)
- **Ready**: Green (#34C759)
- **Primary**: Blue (#007AFF)
- **Danger/Alert**: Red (#FF3B30)

## Real-Time Features

- ✅ Instant order submission to kitchen
- ✅ Real-time status updates across panels
- ✅ Live order tracking
- ✅ Kitchen statistics dashboard
- ✅ Automatic chef assignment based on category

## Future Enhancements

1. **Backend Integration**
   - Connect to REST API
   - Database persistence
   - Multi-location support

2. **Notifications**
   - Push notifications for new orders
   - Sound alerts for ready items
   - Haptic feedback

3. **Analytics**
   - Daily sales reports
   - Chef performance metrics
   - Order history

4. **Additional Features**
   - Bill generation/printing
   - Customer notes/special requests
   - Combo ordering
   - Inventory management

## Key Files Summary

| File | Purpose |
|------|---------|
| `app/index.tsx` | Role selection entry point |
| `app/servant/index.tsx` | Servant dashboard (tables, orders, cart) |
| `app/servant/menu.tsx` | Menu browsing with variants |
| `app/chef/[role].tsx` | Chef panel with dynamic routing |
| `src/store/cafeFlow.ts` | Entire app state management |
| `src/constants/menu.ts` | Menu items and categories database |
| `src/components/UIComponents.tsx` | Reusable UI components |
| `src/utils/helpers.ts` | Utility functions |

## Notes

- No backend currently implemented - uses local state
- All orders are stored in memory (resets on app reload)
- To add backend: Replace Zustand actions with API calls
- TypeScript provides type safety across the app
- Expo Router handles all navigation without manual navigation.tsx

## Development Tips

1. **Adding New Menu Items**: Edit `src/constants/menu.ts`
2. **Changing Colors**: Update `STATUS_COLORS` in constants or component styles
3. **Adding Alerts**: Import and use `Alert` from React Native
4. **Debugging State**: Zustand store is in DevTools-compatible format

## License

Private Project - For use in CafeFlow application only
