import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Custom hook for admin real-time order updates via WebSocket
 * Provides automatic connection management, reconnection logic, and admin-specific event handling
 *
 * @param {Object} options Configuration options
 * @param {boolean} options.enabled - Whether to enable WebSocket connection
 * @param {Function} options.onNewOrder - Callback for new order alerts
 * @param {Function} options.onOrderUpdated - Callback for order updated events
 * @param {Function} options.onStatusChanged - Callback for status change events
 * @param {Function} options.onPaymentUpdated - Callback for payment update events
 * @param {Function} options.onOrderCancelled - Callback for order cancelled events
 * @param {Function} options.onOrderAssigned - Callback for order assignment events
 * @param {Function} options.onOrderCountUpdate - Callback for order count updates
 * @param {boolean} options.showNotifications - Whether to show toast notifications
 * @returns {Object} Socket connection state and methods
 */
const useOrderUpdates = (options = {}) => {
  const {
    enabled = true,
    onNewOrder,
    onOrderUpdated,
    onStatusChanged,
    onPaymentUpdated,
    onOrderCancelled,
    onOrderAssigned,
    onOrderCountUpdate,
    showNotifications = true
  } = options;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [orderCounts, setOrderCounts] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.token;
      }
    } catch (err) {
      console.error('Failed to get auth token:', err);
    }
    return null;
  }, []);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        timeout: 10000
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection successful
      newSocket.on('connect', () => {
        console.log('Admin WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        setReconnectAttempts(0);
      });

      // Connection confirmation from server
      newSocket.on('connected', (data) => {
        console.log('Admin WebSocket connection confirmed:', data);
      });

      // New order alert (admin-specific)
      newSocket.on('order:alert', (data) => {
        console.log('New order alert:', data);
        if (showNotifications && data.notification) {
          toast.success(data.notification.message, {
            duration: 5000,
            icon: '🛒'
          });
        }
        if (onNewOrder) {
          onNewOrder(data);
        }
      });

      // New order created (admin room broadcast)
      newSocket.on('order:new', (data) => {
        console.log('New order received:', data);
        if (onNewOrder) {
          onNewOrder(data);
        }
      });

      // Order updated event
      newSocket.on('order:updated', (data) => {
        console.log('Order updated:', data);
        if (onOrderUpdated) {
          onOrderUpdated(data);
        }
      });

      // Order status changed event
      newSocket.on('order:status_changed', (data) => {
        console.log('Order status changed:', data);
        if (showNotifications) {
          toast(`Order #${data.orderNumber} status: ${data.newStatus}`, {
            icon: '📦'
          });
        }
        if (onStatusChanged) {
          onStatusChanged(data);
        }
      });

      // Payment status updated event
      newSocket.on('order:payment_updated', (data) => {
        console.log('Payment updated:', data);
        if (showNotifications) {
          const message = `Order #${data.orderNumber} payment: ${data.paymentStatus}`;
          if (data.paymentStatus === 'completed') {
            toast.success(message, { icon: '💰' });
          } else {
            toast(message, { icon: '💳' });
          }
        }
        if (onPaymentUpdated) {
          onPaymentUpdated(data);
        }
      });

      // Order cancelled event
      newSocket.on('order:cancelled', (data) => {
        console.log('Order cancelled:', data);
        if (showNotifications) {
          toast.error(`Order #${data.orderNumber} cancelled`, {
            icon: '❌'
          });
        }
        if (onOrderCancelled) {
          onOrderCancelled(data);
        }
      });

      // Order assigned event (admin-specific)
      newSocket.on('order:assigned', (data) => {
        console.log('Order assigned:', data);
        if (showNotifications && data.notification) {
          toast.success(data.notification.message, {
            icon: '👤'
          });
        }
        if (onOrderAssigned) {
          onOrderAssigned(data);
        }
      });

      // Order count update event (admin-specific)
      newSocket.on('orders:count_update', (data) => {
        console.log('Order counts updated:', data);
        setOrderCounts(data);
        if (onOrderCountUpdate) {
          onOrderCountUpdate(data);
        }
      });

      // Disconnection
      newSocket.on('disconnect', (reason) => {
        console.log('Admin WebSocket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Attempt reconnection if it wasn't a manual disconnect
        if (reason !== 'io client disconnect' && enabled) {
          handleReconnect();
        }
      });

      // Connection error
      newSocket.on('connect_error', (err) => {
        console.error('Admin WebSocket connection error:', err.message);
        setIsConnecting(false);
        setError(err.message);

        if (enabled) {
          handleReconnect();
        }
      });

      // General error
      newSocket.on('error', (err) => {
        console.error('Admin WebSocket error:', err);
        setError(err.message || 'WebSocket error occurred');
      });

    } catch (err) {
      console.error('Failed to create Admin WebSocket connection:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [enabled, getAuthToken, onNewOrder, onOrderUpdated, onStatusChanged, onPaymentUpdated, onOrderCancelled, onOrderAssigned, onOrderCountUpdate, showNotifications]);

  // Handle reconnection logic
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached');
      setError('Failed to connect after multiple attempts. Please refresh the page.');
      return;
    }

    reconnectAttemptsRef.current += 1;
    setReconnectAttempts(reconnectAttemptsRef.current);

    console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);

    // Clear existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Attempt reconnection after delay
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.connect();
      } else {
        connect();
      }
    }, RECONNECT_DELAY);
  }, [connect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting Admin WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    }

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Subscribe to specific order updates
  const subscribeToOrder = useCallback((orderId) => {
    if (socketRef.current && isConnected) {
      console.log(`Admin subscribing to order: ${orderId}`);
      socketRef.current.emit('subscribe:order', orderId);
    }
  }, [isConnected]);

  // Unsubscribe from specific order updates
  const unsubscribeFromOrder = useCallback((orderId) => {
    if (socketRef.current && isConnected) {
      console.log(`Admin unsubscribing from order: ${orderId}`);
      socketRef.current.emit('unsubscribe:order', orderId);
    }
  }, [isConnected]);

  // Connect on mount if enabled
  useEffect(() => {
    if (enabled) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    orderCounts,
    connect,
    disconnect,
    subscribeToOrder,
    unsubscribeFromOrder
  };
};

export default useOrderUpdates;
