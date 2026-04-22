import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

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
  const variantStyles = {
    primary: styles.primaryBtn,
    secondary: styles.secondaryBtn,
    danger: styles.dangerBtn,
    success: styles.successBtn,
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
      <Text style={[styles.btnText, textSizeStyles[size]]}>{title}</Text>
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
export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.card, onPress && { marginHorizontal: 8 }, style]}
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
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
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
  return (
    <View style={styles.quantityContainer}>
      <TouchableOpacity onPress={onDecrease} style={styles.qtyBtn}>
        <Text style={styles.qtyBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.qtyText}>{quantity}</Text>
      <TouchableOpacity onPress={onIncrease} style={styles.qtyBtn}>
        <Text style={styles.qtyBtnText}>+</Text>
      </TouchableOpacity>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={[styles.qtyBtn, styles.removeBtn]}>
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
  onStatusChange,
  backgroundColor = '#F5F5F5',
}) => {
  const statusColor =
    {
      pending: '#888888',
      preparing: '#FF9500',
      ready: '#34C759',
    }[status] || '#888888';

  return (
    <TouchableOpacity
      onPress={onStatusChange}
      activeOpacity={onStatusChange ? 0.7 : 1}
      style={[styles.orderItemCard, { backgroundColor }]}
    >
      <View style={styles.orderItemContent}>
        <View style={styles.orderItemLeft}>
          <Text style={styles.orderItemName}>{itemName}</Text>
          <Text style={styles.orderItemVariant}>{variantName}</Text>
          <Text style={styles.orderItemQty}>Qty: {quantity}</Text>
        </View>
        <View style={styles.orderItemRight}>
          <Text style={styles.orderItemPrice}>₹{price}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
  },
  secondaryBtn: {
    backgroundColor: '#E5E5EA',
  },
  dangerBtn: {
    backgroundColor: '#FF3B30',
  },
  successBtn: {
    backgroundColor: '#34C759',
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  largeBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  btnText: {
    fontWeight: '600',
    color: '#FFF',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  sectionHeader: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#DDD',
  },

  orderItemCard: {
    marginVertical: 8,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
  },
  orderItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemRight: {
    alignItems: 'flex-end',
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  orderItemVariant: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'capitalize',
  },
});
