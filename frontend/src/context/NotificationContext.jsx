import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { socket, initializeSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import apiConfig from "../config/apiConfig";

// Use apiConfig for endpoint construction
const ENDPOINTS = apiConfig.ENDPOINTS.NOTIFICATIONS;

// Constants for configuration
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  RECONNECTION_INTERVAL: 30000,
  TOAST_DURATION: 5000,
  MAX_NOTIFICATIONS: 100, // Maximum number of notifications to keep in state
  NOTIFICATION_TYPES: {
    ALERT: 'alert',
    WARNING: 'warning',
    SUCCESS: 'success',
    INFO: 'info'
  }
};

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  
  // Refs for state management
  const isInitialized = useRef(false);
  const processedNotifications = useRef(new Set());
  const socketConnected = useRef(false);
  const retryCount = useRef(0);
  const lastFetchTime = useRef(0);
  const fetchTimeout = useRef(null);

  // Enhanced fetch notifications with caching and rate limiting
  const fetchNotifications = useCallback(async (retry = 0, force = false) => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 seconds cache

    // Prevent too frequent fetches unless forced
    if (!force && now - lastFetchTime.current < CACHE_DURATION) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Clear any existing fetch timeout
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }

      // Ensure apiConfig is initialized
      if (!apiConfig.isInitialized) {
        await apiConfig.initialize();
      }

      const response = await apiConfig.client.get(ENDPOINTS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: CONFIG.MAX_NOTIFICATIONS }
      });
      
      // Reset retry counter on success
      retryCount.current = 0;
      lastFetchTime.current = now;
      
      // Process and validate notifications
      const validNotifications = response.data
        .filter(notification => notification._id)
        .map(notification => ({
          ...notification,
          type: notification.type || CONFIG.NOTIFICATION_TYPES.INFO
        }));

      // Add to processed set
      validNotifications.forEach(notification => {
        if (notification._id) {
          processedNotifications.current.add(notification._id);
        }
      });
      
      // Update state with new notifications
      setNotifications(validNotifications);
      setUnreadCount(validNotifications.filter((n) => !n.read).length);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      
      // Enhanced retry logic with exponential backoff
      if (retry < CONFIG.MAX_RETRIES) {
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, retry);
        console.log(`Retrying fetch notifications (${retry + 1}/${CONFIG.MAX_RETRIES}) in ${delay}ms...`);
        
        fetchTimeout.current = setTimeout(() => {
          fetchNotifications(retry + 1, force);
        }, delay);
      } else {
        setError("Failed to load notifications. Please try again later.");
        setIsLoading(false);
      }
    }
  }, [token]);

  // Enhanced socket setup with better error handling
  const setupNotificationListeners = useCallback(() => {
    if (!socket || !user || !token) {
      console.log("Not setting up notification listeners - missing dependencies");
      return;
    }

    console.log("Setting up notification listeners");
    
    // Clean up existing listeners
    socket.off("notification");
    socket.off("connect");
    socket.off("disconnect");
    socket.off("error");
    
    // Set up notification listener with enhanced validation
    socket.on("notification", (newNotification) => {
      console.log("New notification received:", newNotification);
      
      if (!newNotification || !newNotification._id) {
        console.warn("Received invalid notification without ID:", newNotification);
        return;
      }
      
      // Validate notification type
      if (!Object.values(CONFIG.NOTIFICATION_TYPES).includes(newNotification.type)) {
        newNotification.type = CONFIG.NOTIFICATION_TYPES.INFO;
      }
      
      // Check for duplicates
      if (!processedNotifications.current.has(newNotification._id)) {
        processedNotifications.current.add(newNotification._id);
        
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          // Maintain maximum notification limit
          return updated.slice(0, CONFIG.MAX_NOTIFICATIONS);
        });
        
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
          showNotificationToast(newNotification);
        }
      } else {
        console.log("Duplicate notification prevented:", newNotification._id);
      }
    });

    // Enhanced socket event handlers
    socket.on("connect", () => {
      console.log("Socket connected in notification context");
      socketConnected.current = true;
      setIsConnected(true);
      fetchNotifications(0, true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected in notification context");
      socketConnected.current = false;
      setIsConnected(false);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setError("Connection error. Attempting to reconnect...");
    });

  }, [user, token, fetchNotifications]);

  // Initialize notification system with enhanced error handling
  useEffect(() => {
    if (user && token && !isInitialized.current) {
      console.log("Initializing notification system");
      
      isInitialized.current = true;
      
      try {
        if (!socket) {
          console.log("Socket not initialized, initializing now");
          initializeSocket(token);
        }
        
        fetchNotifications();
        setupNotificationListeners();
      } catch (error) {
        console.error("Error initializing notification system:", error);
        setError("Failed to initialize notification system");
      }
    }

    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [user, token, fetchNotifications, setupNotificationListeners]);

  // Enhanced reconnection logic
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (user && token && !socketConnected.current) {
        console.log("Socket disconnected, attempting to reconnect...");
        try {
          initializeSocket(token);
          setupNotificationListeners();
        } catch (error) {
          console.error("Reconnection attempt failed:", error);
        }
      }
    }, CONFIG.RECONNECTION_INTERVAL);

    return () => clearInterval(pingInterval);
  }, [user, token, setupNotificationListeners]);

  // Enhanced notification deletion with optimistic updates
  const deleteNotification = async (notificationId) => {
    if (!token || !notificationId) return;
    
    // Optimistic update
    const notificationToDelete = notifications.find(n => n._id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read;
    
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await apiConfig.client.delete(
        ENDPOINTS.DELETE(notificationId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert optimistic update on failure
      if (notificationToDelete) {
        setNotifications(prev => [...prev, notificationToDelete]);
        if (wasUnread) {
          setUnreadCount(prev => prev + 1);
        }
      }
      toast.error("Failed to delete notification");
    }
  };

  // Enhanced bulk deletion with optimistic updates
  const deleteAllNotifications = async () => {
    if (!token) return;
    
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications([]);
    setUnreadCount(0);
    
    try {
      await apiConfig.client.delete(
        ENDPOINTS.DELETE_ALL,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      // Revert optimistic update on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter(n => !n.read).length);
      toast.error("Failed to delete all notifications");
    }
  };

  // Enhanced mark as read with optimistic updates
  const markAsRead = async (notificationId) => {
    if (!token || !notificationId) return;
    
    // Optimistic update
    const notificationToUpdate = notifications.find(n => n._id === notificationId);
    const wasUnread = notificationToUpdate && !notificationToUpdate.read;
    
    if (wasUnread) {
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await apiConfig.client.put(
        ENDPOINTS.MARK_READ(notificationId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert optimistic update on failure
      if (notificationToUpdate) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, read: false } : n
          )
        );
        if (wasUnread) {
          setUnreadCount(prev => prev + 1);
        }
      }
      toast.error("Failed to mark notification as read");
    }
  };

  // Enhanced mark all as read with optimistic updates
  const markAllAsRead = async () => {
    if (!token) return;
    
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    try {
      await apiConfig.client.put(
        ENDPOINTS.MARK_ALL_READ,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert optimistic update on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Enhanced toast notification with better styling
  const showNotificationToast = (notification) => {
    if (!notification || !notification._id) return;
    
    const toastStyle = {
      background: notification.type === CONFIG.NOTIFICATION_TYPES.ALERT ? '#fee2e2' :
                 notification.type === CONFIG.NOTIFICATION_TYPES.WARNING ? '#fef3c7' :
                 notification.type === CONFIG.NOTIFICATION_TYPES.SUCCESS ? '#dcfce7' :
                 '#f1f5f9',
      color: '#1e293b',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };
    
    toast.info(
      <div 
        onClick={() => markAsRead(notification._id)} 
        style={{ cursor: "pointer" }}
        className="notification-toast"
      >
        <strong style={{ display: 'block', marginBottom: '4px' }}>
          {notification.title || "New Notification"}
        </strong>
        <small style={{ opacity: 0.8 }}>
          {notification.message || ""}
        </small>
      </div>,
      {
        position: "top-right",
        autoClose: CONFIG.TOAST_DURATION,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => markAsRead(notification._id),
        style: toastStyle
      }
    );
  };

  // Enhanced refresh function with force parameter
  const refreshNotifications = (force = false) => {
    fetchNotifications(0, force);
  };

  return (
    <NotificationContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        isLoading,
        error,
        isConnected,
        markAsRead, 
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};