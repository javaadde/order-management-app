import React from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  ViewStyle,
  Image,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
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
      <Text style={[styles.btnText, textSizeStyles[size], { color: variant === 'secondary' ? t.text : '#ffffff' }]}>
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
export const Badge: React.FC<BadgeProps> = ({ label, color, textColor }) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];

  return (
    <View style={[styles.badge, { backgroundColor: color || t.accent }]}>
      <Text style={[styles.badgeText, { color: textColor || (theme === 'dark' ? '#121212' : '#ffffff') }]}>{label}</Text>
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
          <Text style={[styles.qtyBtnText, { color: '#d94624' }]}>✕</Text>
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
        <View style={[styles.orderItemRight]}>
          <Text style={[styles.orderItemPrice, { color: t.accent }]}>₹{price}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={[styles.statusText, { color: status === 'ready' ? '#ffffff' : '#ffffff' }]}>{status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface NavBarProps {
  title: string;
  subtitle?: string;
  onLogout: () => void;
  showResetPassword?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

/**
 * Modern NavBar Component
 * Includes account details, user name, and settings options
 */
export const NavBar: React.FC<NavBarProps> = ({ 
  title, 
  subtitle, 
  onLogout,
  showResetPassword = true,
  showBack = false,
  onBack,
  rightComponent
}) => {
  const { theme } = useCafeFlowStore();
  const t = COLORS[theme];
  const [showMenu, setShowMenu] = React.useState(false);
  const router = useRouter();

  const handleResetPassword = () => {
    setShowMenu(false);
    Alert.alert(
      'Reset Password',
      'A password reset link has been sent to your registered contact.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.navBar, { backgroundColor: t.accent }]}>
      <View style={styles.navBarLeftRow}>
        {showBack && (
          <TouchableOpacity 
            onPress={onBack || (() => router.back())}
            style={[styles.backButton, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }]}
          >
            <Text style={[styles.navIconText, { color: theme === 'dark' ? '#121212' : '#ffffff' }]}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.navBarLeft}>
          <Text style={[styles.navBarTitle, { color: theme === 'dark' ? '#121212' : '#ffffff' }]}>{title}</Text>
          {subtitle && <Text style={[styles.navBarSubtitle, { color: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)' }]}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.navBarRight}>
        {rightComponent}
        <TouchableOpacity 
          onPress={() => setShowMenu(true)}
          style={[
            styles.userAvatar,
            { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' },
            rightComponent ? { marginLeft: 12 } : undefined,
          ]}
        >
          <Text style={[styles.avatarIconText, { color: theme === 'dark' ? '#121212' : '#ffffff' }]}>U</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.navMenu, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={styles.menuHeader}>
              <View style={[styles.menuAvatar, { backgroundColor: t.accent }]}>
                <Text style={[styles.menuAvatarText, { color: theme === 'dark' ? '#121212' : '#ffffff' }]}>U</Text>
              </View>
              <View style={styles.menuHeaderText}>
                <Text style={[styles.menuName, { color: t.text }]}>{title}</Text>
                <Text style={[styles.menuRole, { color: t.muted }]}>{subtitle || 'Staff Member'}</Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: t.border }]} />

            {showResetPassword && (
              <TouchableOpacity style={styles.menuItem} onPress={handleResetPassword}>
                <Text style={[styles.menuIconText, { color: t.text }]}>#</Text>
                <Text style={[styles.menuItemText, { color: t.text }]}>Reset Password</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onLogout(); }}>
              <Text style={[styles.menuIconText, { color: '#DC2626' }]}>×</Text>
              <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  primaryBtn: {
  },
  secondaryBtn: {
    borderWidth: 1,
  },
  dangerBtn: {
    backgroundColor: '#DC2626', // Red 600
  },
  successBtn: {
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mediumBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  largeBtn: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  btnText: {
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
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
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
  },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },

  sectionHeader: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0,
  },


  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
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
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
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
    marginTop: 6,
    fontWeight: '700',
  },
  orderItemPrice: {
    fontSize: 18,
    fontWeight: '900',
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
  navBar: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 12,
  },
  navBarLeft: {
    flex: 1,
  },
  navBarLeftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navBarTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.5,
  },
  navBarSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  navBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  navMenu: {
    width: 280,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  menuHeaderText: {
    flex: 1,
  },
  menuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuAvatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  menuName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  menuRole: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  navIconText: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 34,
  },
  avatarIconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  menuIconText: {
    width: 20,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
});
