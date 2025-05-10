import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { socket, initializeSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import apiConfig from "../config/apiConfig";

// Use apiConfig for endpoint construction
const ENDPOINTS = apiConfig.ENDPOINTS.NOTIFICATIONS;

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  
  // Use ref to track if initialization is complete
  const isInitialized = useRef(false);
  
  // Use ref to store processed notification IDs
  const processedNotifications = useRef(new Set());

  // Use ref to track connection state
  const socketConnected = useRef(false);

  // Retry mechanism for API calls
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  // Function to fetch notifications with retry logic
  const fetchNotifications = useCallback(async (retry = 0) => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Ensure apiConfig is initialized
      if (!apiConfig.isInitialized) {
        await apiConfig.initialize();
      }

      // Construct the URL using apiConfig.client instance
      const response = await apiConfig.client.get(ENDPOINTS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reset retry counter on success
      retryCount.current = 0;
      
      // Add fetched notification IDs to processed set to prevent duplicates
      const validNotifications = response.data.filter(notification => notification._id);
      validNotifications.forEach(notification => {
        if (notification._id) {
          processedNotifications.current.add(notification._id);
        }
      });
      
      setNotifications(validNotifications);
      setUnreadCount(validNotifications.filter((n) => !n.read).length);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      
      // Retry logic for network/connectivity errors
      if (retry < MAX_RETRIES) {
        console.log(`Retrying fetch notifications (${retry + 1}/${MAX_RETRIES})...`);
        setTimeout(() => fetchNotifications(retry + 1), 2000 * (retry + 1));
      } else {
        setError("Failed to load notifications. Please try again later.");
        setIsLoading(false);
      }
    }
  }, [token]);

  // Setup socket connection and event listeners
  const setupNotificationListeners = useCallback(() => {
    if (!socket || !user || !token) {
      console.log("Not setting up notification listeners - missing dependencies");
      return;
    }

    console.log("Setting up notification listeners");
    
    // Clean up existing listeners first
    socket.off("notification");
    
    // Set up notification listener with duplicate prevention
    socket.on("notification", (newNotification) => {
      console.log("New notification received:", newNotification);
      
      if (!newNotification || !newNotification._id) {
        console.warn("Received invalid notification without ID:", newNotification);
        return;
      }
      
      // Check if we've already processed this notification
      if (!processedNotifications.current.has(newNotification._id)) {
        // Add to processed set
        processedNotifications.current.add(newNotification._id);
        
        // Update state
        setNotifications(prev => [newNotification, ...prev]);
        
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
          showNotificationToast(newNotification);
        }
      } else {
        console.log("Duplicate notification prevented:", newNotification._id);
      }
    });

    // Listen for socket connection status
    socket.on("connect", () => {
      console.log("Socket connected in notification context");
      socketConnected.current = true;
      
      // Refresh notifications when socket reconnects
      fetchNotifications();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected in notification context");
      socketConnected.current = false;
    });

  }, [user, token, fetchNotifications]);

  // Initialize notification system
  useEffect(() => {
    // Only proceed if we have user and token and aren't already initialized
    if (user && token && !isInitialized.current) {
      console.log("Initializing notification system");
      
      // Mark as initialized to prevent duplicate initialization
      isInitialized.current = true;
      
      // Ensure socket is initialized
      if (!socket) {
        console.log("Socket not initialized, initializing now");
        initializeSocket(token);
      }
      
      // Fetch initial notifications
      fetchNotifications();
      
      // Set up socket listeners
      setupNotificationListeners();
    }

    // Cleanup function
    return () => {
      // No need to remove listeners here as we want to maintain connection
    };
  }, [user, token, fetchNotifications, setupNotificationListeners]);

  // Handle reconnection logic
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (user && token && !socketConnected.current) {
        console.log("Socket disconnected, attempting to reconnect...");
        initializeSocket(token);
        setupNotificationListeners();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(pingInterval);
  }, [user, token, setupNotificationListeners]);

  const deleteNotification = async (notificationId) => {
    if (!token || !notificationId) return;
    
    try {
      await apiConfig.client.delete(
        ENDPOINTS.DELETE(notificationId),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => 
        prev.filter((n) => n._id !== notificationId)
      );
      
      // Update unread count if needed
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Don't update state if the API call fails
    }
  };

  const deleteAllNotifications = async () => {
    if (!token) return;
    
    try {
      await apiConfig.client.delete(
        ENDPOINTS.DELETE_ALL,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      // Don't update state if the API call fails
    }
  };

  const markAsRead = async (notificationId) => {
    if (!token || !notificationId) return;
    
    try {
      await apiConfig.client.put(
        ENDPOINTS.MARK_READ(notificationId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Only decrement unread count if notification wasn't already read
      const targetNotification = notifications.find(n => n._id === notificationId);
      if (targetNotification && !targetNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Don't update state if the API call fails
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      await apiConfig.client.put(
        ENDPOINTS.MARK_ALL_READ,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Don't update state if the API call fails
    }
  };

  const showNotificationToast = (notification) => {
    if (!notification || !notification._id) return;
    
    toast.info(
      <div 
        onClick={() => markAsRead(notification._id)} 
        style={{ cursor: "pointer" }}
        className="notification-toast"
      >
        <strong>{notification.title || "New Notification"}</strong>
        <br />
        <small>{notification.message || ""}</small>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => markAsRead(notification._id)
      }
    );
  };

  // Manual refresh function for user-triggered refreshes
  const refreshNotifications = () => {
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        isLoading,
        error,
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