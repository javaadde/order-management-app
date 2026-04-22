/**
 * Generate unique IDs
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(0)}`;
};

/**
 * Format time - show relative time
 */
export const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleTimeString();
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    pending: '#888888',
    preparing: '#FF9500',
    ready: '#34C759',
    partially_ready: '#FF9500',
    served: '#5AC8FA',
  };
  return colors[status] || '#888888';
};

/**
 * Format order ID for display
 */
export const formatOrderId = (id: string): string => {
  return `#${id.substring(0, 8).toUpperCase()}`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
