/**
 * Global API Client
 * 
 * A centralized API client with proper error handling,
 * authentication, token refresh, and logging capabilities.
 */

import axios from 'axios';
import apiConfig from './apiConfig'; // Adjust path as needed

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: apiConfig.API_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for handling cookies consistently with your current code
});

/**
 * Validates if a token looks like a proper JWT
 * @param {string} token - The token to validate
 * @returns {boolean} True if the token looks valid
 */
export const isValidTokenFormat = (token) => {
  // Basic check: JWT should have 3 parts separated by dots
  // and be a non-empty string
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  return parts.length === 3;
};

// Request interceptor - adds auth token and handles request preparation
apiClient.interceptors.request.use(
  (config) => {
    // Get auth token
    const token = localStorage.getItem('token');
    
    // Only add token if it exists AND has valid format
    if (token && isValidTokenFormat(token)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (token && !isValidTokenFormat(token)) {
      // If token exists but is invalid, remove it
      console.warn('[API] Malformed token detected and removed');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    
    // Ensure credentials are included
    config.withCredentials = true;
    
    // Prevent caching for GET requests
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-cache, no-store';
      config.headers['Pragma'] = 'no-cache';
    }
    
    // Log requests in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles common errors and responses
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    
    return response;
  },
  async (error) => {
    // Extract error details
    const errorResponse = {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };
    
    const originalRequest = error.config;
    
    // Special handling for common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401: // Unauthorized - token expired or invalid
          console.error('[API] Authentication error - invalid or expired token');
          
          // Attempt to refresh token if not already tried
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // Attempt to refresh the token
              // This assumes you have a refreshToken endpoint and refreshToken in storage
              const refreshToken = localStorage.getItem('refreshToken');
              
              if (refreshToken) {
                // Create a new instance to avoid interceptors
                const refreshResponse = await axios.post(
                  `${apiConfig.API_URL}${apiConfig.ENDPOINTS.AUTH.REFRESH}`, 
                  { refreshToken },
                  { withCredentials: true }
                );
                
                if (refreshResponse.data.token) {
                  // Store the new token
                  localStorage.setItem('token', refreshResponse.data.token);
                  if (refreshResponse.data.refreshToken) {
                    localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
                  }
                  
                  // Update the failed request with new token and retry
                  originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.token}`;
                  return axios(originalRequest);
                }
              }
              
              // If we reach here, refresh failed or wasn't possible
              throw new Error('Token refresh failed');
            } catch (refreshError) {
              console.error('[API] Token refresh failed:', refreshError);
              
              // Clear invalid tokens
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              
              // Redirect to login if not already there
              if (window.location.pathname !== '/login') {
                // Store the current path to redirect back after login
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                window.location.href = '/login';
              }
            }
          } else {
            // Clear invalid token if refresh already attempted
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
              // Store the current path to redirect back after login
              sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
              window.location.href = '/login';
            }
          }
          break;
          
        case 403: // Forbidden - permissions issue
          console.error('[API] Permission denied');
          break;
          
        case 404: // Not found
          console.error(`[API] Resource not found: ${errorResponse.url}`);
          
          // Special handling for auth/user route - treat as auth error
          if (error.config?.url?.includes(apiConfig.ENDPOINTS.AUTH.USER)) {
            console.warn('[API] User authentication endpoint not found - treating as auth error');
            // Clear token since we can't validate it
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
              sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
              window.location.href = '/login';
            }
          }
          break;
          
        case 500: // Server error
        case 502: // Bad gateway
        case 503: // Service unavailable
        case 504: // Gateway timeout
          console.error(`[API] Server error (${error.response.status}): ${error.response.data?.message || 'Unknown server error'}`);
          break;
          
        default:
          console.error(`[API] Error ${error.response.status}:`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('[API] Network error - no response received');
      
      // Check if server is unreachable
      if (error.message === 'Network Error') {
        // Could show a "server unreachable" UI notification here
      }
    } else {
      // Error in setting up the request
      console.error('[API] Error in request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper method to check if the error is a network error
 * @param {Error} error - The error from an API call
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
  return !error.response && (error.message === 'Network Error' || error.message.includes('Network Error'));
};

/**
 * Helper method to check if the error is an auth error
 * @param {Error} error - The error from an API call
 * @returns {boolean} True if it's an auth error (401)
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Helper method to get a user-friendly error message
 * @param {Error} error - The error from an API call
 * @returns {string} A user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection or try again later.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  switch (error.response?.status) {
    case 401:
      return 'Authentication required. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      // Check if it's specifically the /api/auth/user endpoint
      if (error.config?.url?.includes(apiConfig.ENDPOINTS.AUTH.USER)) {
        return 'Unable to retrieve user information. Please login again.';
      }
      return 'The requested resource was not found.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Enhanced API functions for common operations
 */
export const api = {
  /**
   * Get user profile information
   * @returns {Promise} Promise resolving to user data
   */
  getUserProfile: async () => {
    try {
      const response = await apiClient.get(apiConfig.ENDPOINTS.AUTH.USER);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get user profile:', error);
      throw error;
    }
  },
  
  /**
   * Get user points and streak
   * @returns {Promise} Promise resolving to points data
   */
  getUserPoints: async () => {
    try {
      const response = await apiClient.get(apiConfig.ENDPOINTS.POINTS.USER_POINTS);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get user points:', error);
      throw error;
    }
  },
  
  /**
   * Get leaderboard data
   * @returns {Promise} Promise resolving to leaderboard data
   */
  getLeaderboard: async () => {
    try {
      const response = await apiClient.get(apiConfig.ENDPOINTS.POINTS.LEADERBOARD);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get leaderboard:', error);
      throw error;
    }
  },
  
  /**
   * Perform daily check-in
   * @returns {Promise} Promise resolving to check-in result
   */
  dailyCheckIn: async () => {
    try {
      const response = await apiClient.post(apiConfig.ENDPOINTS.POINTS.CHECKIN);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to perform daily check-in:', error);
      throw error;
    }
  },
  
  /**
   * Generate matches for the user
   * @param {string} userId - User ID to generate matches for
   * @returns {Promise} Promise resolving to matches data
   */
  generateMatches: async (userId) => {
    try {
      const response = await apiClient.post(apiConfig.ENDPOINTS.MATCHES.GENERATE, { userId });
      return response.data;
    } catch (error) {
      console.error('[API] Failed to generate matches:', error);
      throw error;
    }
  },
  
  /**
   * Get completed sessions count
   * @param {string} userId - User ID to get sessions for
   * @returns {Promise} Promise resolving to sessions count
   */
  getCompletedSessionsCount: async (userId) => {
    try {
      const response = await apiClient.get(`${apiConfig.ENDPOINTS.SESSIONS.COMPLETED}/${userId}`);
      return response.data.count;
    } catch (error) {
      console.error('[API] Failed to get completed sessions count:', error);
      throw error;
    }
  }
};

export default apiClient;