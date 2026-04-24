import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  ViewStyle,
  Image,
} from 'react-native';
import { useCafeFlowStore } from '../store/cafeFlow';
import { COLORS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Reusable Button Component
 * POS-style touch-friendly buttons
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];

  const variantStyles = {
    primary: [styles.primaryBtn, { backgroundColor: t.accent }],
    secondary: [styles.secondaryBtn, { backgroundColor: t.card, borderColor: t.border }],
    danger: styles.dangerBtn,
    success: [styles.successBtn, { backgroundColor: t.accent }],
  };

  const sizeStyles = {
    small: styles.smallBtn,
    medium: styles.mediumBtn,
    large: styles.largeBtn,
  };

  const textSizeStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.btnText, textSizeStyles[size], { color: variant === 'secondary' ? t.text : '#121212' }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

/**
 * Card Component for displaying content
 */
// Card component
export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card, 
        { backgroundColor: t.card, borderColor: t.border },
        onPress && { marginHorizontal: 8 }, 
        style
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

/**
 * Badge Component for status indicators
 */
export const Badge: React.FC<BadgeProps> = ({ label, color = '#007AFF', textColor = '#FFF' }) => {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Section Header Component
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: t.accent }]}>{title}</Text>
      {subtitle && <Text style={[styles.sectionSubtitle, { color: t.muted }]}>{subtitle}</Text>}
    </View>
  );
};

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove?: () => void;
}

/**
 * Quantity Selector for order items
 */
export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];

  return (
    <View style={[styles.quantityContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
      <TouchableOpacity onPress={onDecrease} style={[styles.qtyBtn, { backgroundColor: t.card }]}>
        <Text style={[styles.qtyBtnText, { color: t.accent }]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.qtyText, { color: t.text }]}>{quantity}</Text>
      <TouchableOpacity onPress={onIncrease} style={[styles.qtyBtn, { backgroundColor: t.card }]}>
        <Text style={[styles.qtyBtnText, { color: t.accent }]}>+</Text>
      </TouchableOpacity>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={[styles.qtyBtn, styles.removeBtn, { backgroundColor: theme === 'dark' ? '#450a0a' : '#FEF2F2' }]}>
          <Text style={[styles.qtyBtnText, { color: '#FF3B30' }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface OrderItemCardProps {
  itemName: string;
  variantName: string;
  quantity: number;
  price: number;
  status: string;
  image?: any;
  onStatusChange?: () => void;
  backgroundColor?: string;
}

/**
 * Order Item Card for displaying items in orders
 */
export const OrderItemCard: React.FC<OrderItemCardProps> = ({
  itemName,
  variantName,
  quantity,
  price,
  status,
  image,
  onStatusChange,
  backgroundColor,
}) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];

  const statusColor =
    {
      pending: '#888888',
      preparing: '#FF9500',
      ready: t.accent,
    }[status] || '#888888';

  return (
    <TouchableOpacity
      onPress={onStatusChange}
      activeOpacity={onStatusChange ? 0.7 : 1}
      style={[styles.orderItemCard, { backgroundColor: backgroundColor || t.card, borderColor: t.border, borderWidth: 1 }]}
    >
      <View style={styles.orderItemContent}>
        {image && (
          <View style={styles.orderItemImageContainer}>
            <Image source={image} style={styles.orderItemImage} resizeMode="cover" />
          </View>
        )}
        <View style={styles.orderItemLeft}>
          <Text style={[styles.orderItemName, { color: t.text }]}>{itemName}</Text>
          <Text style={[styles.orderItemVariant, { color: t.muted }]}>{variantName}</Text>
          <Text style={[styles.orderItemQty, { color: t.accent }]}>Qty: {quantity}</Text>
        </View>
        <View style={styles.orderItemRight}>
          <Text style={[styles.orderItemPrice, { color: t.accent }]}>₹{price}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={[styles.statusText, { color: status === 'ready' ? '#121212' : '#FFF' }]}>{status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24, // More rounded for modern look
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  primaryBtn: {
    backgroundColor: '#C5A47E', // Gold
  },
  secondaryBtn: {
    backgroundColor: '#1C1C1C', // Dark Gray
    borderWidth: 1,
    borderColor: '#C5A47E',
  },
  dangerBtn: {
    backgroundColor: '#DC2626', // Red 600
  },
  successBtn: {
    backgroundColor: '#C5A47E', // Gold
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  mediumBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  largeBtn: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 35,
  },
  btnText: {
    fontWeight: '700',
    color: '#121212', // Dark text on gold buttons
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },

  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionHeader: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#C5A47E',
    marginBottom: 4,
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
  },


  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C5A47E',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
    color: '#F5F5F5',
  },
  removeBtn: {
    marginLeft: 8,
    backgroundColor: '#FEF2F2',
  },

  orderItemCard: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  orderItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  orderItemImage: {
    width: '100%',
    height: '100%',
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemRight: {
    alignItems: 'flex-end',
  },
  orderItemName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F5F5F5',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  orderItemVariant: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  orderItemQty: {
    fontSize: 13,
    color: '#C5A47E',
    marginTop: 6,
    fontWeight: '700',
  },
  orderItemPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#C5A47E',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
