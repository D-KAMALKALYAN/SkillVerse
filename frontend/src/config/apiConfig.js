/**
 * Enhanced API Configuration
 * 
 * Combines the best features of both apiConfig.js and apiClient.js
 * with improved error handling and correct URL configuration.
 */

import axios from 'axios';

// Configuration options
const ENVIRONMENTS = {
  DEVELOPMENT: {
    API_URL: 'http://localhost:4000/api',
    BACKEND_URL: 'http://localhost:4000',
  },
  PRODUCTION: {
    API_URL: 'https://skillverse-backend.onrender.com/api',
    BACKEND_URL: 'https://skillverse-backend.onrender.com',
  }
};

// Endpoints configuration
const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
    HEALTH: '/health', // Health check endpoint
    RESET_PASSWORD: '/auth/reset-password',
    RESET_PASSWORD_CONFIRM: '/auth/reset-password/confirm',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/mark-read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}/delete`,
    DELETE_ALL: '/notifications/delete-all'
  },
  POINTS: {
    LEADERBOARD: '/points/leaderboard'
  }
};

/**
 * Check if an error is a network error
 */
export const isNetworkError = (error) => {
  return (
    !error.response && 
    error.message && (
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET') ||
      error.code === 'ECONNABORTED'
    )
  );
};

/**
 * Get a user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (error.response) {
    // Server responded with an error status
    const { status, data } = error.response;
    
    // Check if the server provided an error message
    if (data && typeof data === 'object') {
      if (data.message) return data.message;
      if (data.error) return typeof data.error === 'string' ? data.error : 'An error occurred';
    }
    
    // Default messages based on status code
    switch (status) {
      case 400: return 'Invalid request. Please check your information and try again.';
      case 401: return 'Authentication required. Please log in again.';
      case 403: return 'You don\'t have permission to access this resource.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'A conflict occurred. The resource might already exist.';
      case 422: return 'The provided data is invalid.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'Server error. Please try again later.';
      default: return `Request failed with status ${status}.`;
    }
  }
  
  // Generic error message as fallback
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Helper function to check API availability
const checkApiConnectivity = async (url) => {
  try {
    const healthEndpoint = `${url.replace(/\/api\/?$/, '')}/health`;
    console.log(`[API] Testing connectivity: ${healthEndpoint}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(healthEndpoint, { 
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`[API] Connectivity test failed for ${url}:`, error.message);
    return false;
  }
};

// API configuration singleton
const apiConfig = {
  // Initialize with default values to avoid undefined
  API_URL: ENVIRONMENTS.PRODUCTION.API_URL,
  BACKEND_URL: ENVIRONMENTS.PRODUCTION.BACKEND_URL,
  ENDPOINTS,
  isInitialized: false,
  isProduction: true,
  
  /**
   * Initialize API configuration based on environment
   */
  async initialize() {
    // Prevent multiple initializations
    if (this.isInitialized) return this;
    
    try {
      // Determine environment
      const isLocalhost = 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      
      const isLocalURL =
        window.location.hostname.includes('.local') ||
        window.location.hostname.includes('.test');
        
      const isDevelopmentMode =
        (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ||
        window.location.hostname.includes('dev.') ||
        window.location.hostname.includes('stage.');
        
      console.log(`[API] Environment detection: isLocalhost=${isLocalhost}, isLocalURL=${isLocalURL}, isDevelopmentMode=${isDevelopmentMode}`);
      
      // Default to development if on localhost/development, otherwise production
      const environment = (isLocalhost || isLocalURL || isDevelopmentMode)
        ? ENVIRONMENTS.DEVELOPMENT
        : ENVIRONMENTS.PRODUCTION;
      
      this.API_URL = environment.API_URL;
      this.BACKEND_URL = environment.BACKEND_URL;
      this.isProduction = environment === ENVIRONMENTS.PRODUCTION;
      
      console.log(`[API] Using ${this.isProduction ? 'production' : 'development'} API endpoint: ${this.API_URL}`);
      console.log(`[API] Backend URL: ${this.BACKEND_URL}`);
      
      // Verify connectivity to selected environment
      const isConnected = await checkApiConnectivity(this.API_URL);
      
      // If production is selected but not working, try development and vice versa
      if (!isConnected) {
        const alternateEnv = this.isProduction ? ENVIRONMENTS.DEVELOPMENT : ENVIRONMENTS.PRODUCTION;
        const altConnected = await checkApiConnectivity(alternateEnv.API_URL);
        
        if (altConnected) {
          console.log(`[API] Primary environment unreachable, switching to alternate environment`);
          this.API_URL = alternateEnv.API_URL;
          this.BACKEND_URL = alternateEnv.BACKEND_URL;
          this.isProduction = alternateEnv === ENVIRONMENTS.PRODUCTION;
          
          console.log(`[API] Now using ${this.isProduction ? 'production' : 'development'} endpoint: ${this.API_URL}`);
        } else {
          console.warn(`[API] Both environments unreachable, sticking with original selection`);
        }
      }
      
      this.isInitialized = true;
      
      // Initialize API client after configuration is set
      this.client = this.createApiClient();
      
      return this;
    } catch (error) {
      console.error('[API] Error during initialization:', error);
      this.forceProductionMode();
      this.isInitialized = true;
      
      // Initialize API client with production settings
      this.client = this.createApiClient();
      
      return this;
    }
  },
  
  /**
   * Force production mode (used as fallback)
   */
  forceProductionMode() {
    const wasChanged = this.API_URL !== ENVIRONMENTS.PRODUCTION.API_URL;
    
    this.API_URL = ENVIRONMENTS.PRODUCTION.API_URL;
    this.BACKEND_URL = ENVIRONMENTS.PRODUCTION.BACKEND_URL;
    this.isProduction = true;
    
    if (wasChanged) {
      console.log(`[API] Forced production mode: ${this.API_URL}`);
    }
    
    // Update client if it exists
    if (this.client) {
      this.client.defaults.baseURL = this.API_URL;
    }
    
    return this;
  },
  
  /**
   * Force development mode (for testing)
   */
  forceDevelopmentMode() {
    const wasChanged = this.API_URL !== ENVIRONMENTS.DEVELOPMENT.API_URL;
    
    this.API_URL = ENVIRONMENTS.DEVELOPMENT.API_URL;
    this.BACKEND_URL = ENVIRONMENTS.DEVELOPMENT.BACKEND_URL;
    this.isProduction = false;
    
    if (wasChanged) {
      console.log(`[API] Forced development mode: ${this.API_URL}`);
    }
    
    // Update client if it exists
    if (this.client) {
      this.client.defaults.baseURL = this.API_URL;
    }
    
    return this;
  },
  
  /**
   * Create and configure axios instance
   */
  createApiClient() {
    const client = axios.create({
      baseURL: this.API_URL,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true // Important for CORS with credentials
    });
    
    // Request interceptor to add auth token and handle CORS
    client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add CORS headers for all requests
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        
        // Log outgoing requests in development
        if (!this.isProduction) {
          console.log(`[API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        
        return config;
      },
      error => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for handling common errors
    client.interceptors.response.use(
      response => {
        // Log responses in development
        if (!this.isProduction) {
          console.log(`[API] Response ${response.status} from ${response.config.url}`);
        }
        return response;
      },
      async error => {
        // Log detailed error information
        if (error.response) {
          const { status, data, config } = error.response;
          console.error(`[API] Error ${status}:`, data);
          
          // Handle 401 Unauthorized - token expired
          if (status === 401 && !config._retry) {
            // Try to refresh token if available
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken && this.ENDPOINTS.AUTH.REFRESH_TOKEN) {
              config._retry = true;
              
              try {
                // Attempt to refresh the token
                const refreshEndpoint = `${this.API_URL}${this.ENDPOINTS.AUTH.REFRESH_TOKEN}`;
                console.log(`[API] Attempting to refresh token: ${refreshEndpoint}`);
                
                const res = await axios.post(
                  refreshEndpoint, 
                  { refreshToken },
                  { withCredentials: true }
                );
                
                if (res.data.token) {
                  localStorage.setItem('token', res.data.token);
                  
                  // Retry the original request with new token
                  config.headers.Authorization = `Bearer ${res.data.token}`;
                  return client(config);
                }
              } catch (refreshError) {
                console.error('[API] Token refresh failed:', refreshError);
                
                // Clear auth data on refresh failure
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                
                // Redirect to login if needed
                if (window.location.pathname !== '/login') {
                  window.location.href = '/login';
                }
              }
            } else {
              // No refresh token available - clear auth
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Redirect to login if needed and not already there
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          }
        } else if (isNetworkError(error)) {
          console.error('[API] Network error - no response received');
        } else {
          console.error('[API] Request error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
    
    return client;
  },
  
  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const healthEndpoint = `${this.BACKEND_URL}/health`;
      console.log(`[API] Health check: ${healthEndpoint}`);
      const response = await axios.get(healthEndpoint, { timeout: 5000 });
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error('[API] Health check failed:', error.message);
      return false;
    }
  }
};

// Auto-initialize on import
(async function() {
  try {
    await apiConfig.initialize();
  } catch (error) {
    console.error('[API] Failed to initialize config:', error);
    console.log('[API] Falling back to production settings');
    apiConfig.forceProductionMode();
  }
})();

export default apiConfig;