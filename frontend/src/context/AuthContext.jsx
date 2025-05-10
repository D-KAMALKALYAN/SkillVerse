import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { initializeSocket } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Load user & token from localStorage
  useEffect(() => {
    const loadUserSession = async () => {
      setIsValidating(true);
      setAuthError(null);
      
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser._id) {
              setUser(parsedUser);
              setToken(storedToken);
              
              // Initialize socket connection with the token
              if (!socketInitialized) {
                const socket = initializeSocket(storedToken);
                if (socket) {
                  setSocketInitialized(true);
                  
                  // Set up socket reconnection logic
                  socket.on('reconnect', () => {
                    console.log('Socket reconnected, re-authenticating...');
                    socket.auth = { token: storedToken };
                    socket.connect();
                  });
                }
              }
            } else {
              // Invalid user object
              console.warn("Invalid user data in localStorage");
              localStorage.removeItem("user");
              localStorage.removeItem("token");
            }
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setAuthError("Session data corrupted. Please log in again.");
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        setAuthError("Could not access session storage. Please check browser permissions.");
      } finally {
        setIsValidating(false);
      }
    };
    
    loadUserSession();
  }, []); 
  
  // Login function with error handling
  const login = useCallback((userData, authToken) => {
    if (!userData || !authToken) {
      console.error("Invalid login data provided");
      setAuthError("Invalid login data");
      return false;
    }
    
    try {
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      
      // Update state
      setUser(userData);
      setToken(authToken);
      setAuthError(null);
      
      // Initialize socket connection
      const socket = initializeSocket(authToken);
      if (socket) {
        setSocketInitialized(true);
      }
      
      // Mark as just logged in for special handling in other components
      sessionStorage.setItem('justLoggedIn', 'true');
      
      return true;
    } catch (error) {
      console.error("Error storing user data:", error);
      setAuthError("Could not save login session");
      return false;
    }
  }, []);
  
  // Logout function to clear user session
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem('justLoggedIn');
      
      // Import socket service only when needed to avoid circular dependencies
      const socketService = require('../services/socketService');
      if (socketService.socket) {
        socketService.socket.disconnect();
      }
      
      // Update state at the end to ensure UI updates after other operations
      setUser(null);
      setToken(null);
      setSocketInitialized(false);
      setAuthError(null);
      
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  }, []);
  
  // Update user data without full login/logout
  const updateUserData = useCallback((updatedUserData) => {
    try {
      if (!user || !user._id) {
        console.error("Cannot update user data when not logged in");
        return false;
      }
      
      // Merge with existing user data
      const mergedUserData = {
        ...user,
        ...updatedUserData,
        // Ensure _id doesn't change
        _id: user._id
      };
      
      // Update localStorage and state
      localStorage.setItem("user", JSON.stringify(mergedUserData));
      setUser(mergedUserData);
      return true;
    } catch (error) {
      console.error("Error updating user data:", error);
      return false;
    }
  }, [user]);
  
  // Memoized value to prevent unnecessary re-renders
  const authContextValue = useMemo(() => ({ 
    user, 
    token, 
    login, 
    logout,
    updateUserData,
    socketInitialized,
    isValidating,
    authError
  }), [user, token, login, logout, updateUserData, socketInitialized, isValidating, authError]);
  
  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};