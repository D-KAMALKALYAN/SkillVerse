/**
 * API Client
 * 
 * Configured axios instance with robust error handling, retries,
 * and request/response interceptors.
 */

import axios from 'axios';
import apiConfig from './apiConfig';

/**
 * Check if an error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's a network error
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
 * @param {Error} error - The error to process
 * @returns {string} User-friendly error message
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

// Add a health check function to verify API connectivity
export const checkApiHealth = async () => {
  try {
    const healthEndpoint = `${apiConfig.API_URL.replace(/\/api\/?$/, '')}/health`;
    console.log(`[API] Health check: ${healthEndpoint}`);
    const response = await axios.get(healthEndpoint, { timeout: 5000 });
    return response.data && response.data.status === 'success';
  } catch (error) {
    console.error('[API] Health check failed:', error.message);
    return false;
  }
};

// Create axios instance with base URL from config
const apiClient = axios.create({
  baseURL: apiConfig.API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for CORS with credentials
});

// Request interceptor to add auth token and handle CORS
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CORS headers for all requests
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    // Log outgoing requests in development
    if (process.env.NODE_ENV !== 'production') {
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
apiClient.interceptors.response.use(
  response => {
    // Log responses in development
    if (process.env.NODE_ENV !== 'production') {
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
        
        if (refreshToken && apiConfig.ENDPOINTS.AUTH.REFRESH_TOKEN) {
          config._retry = true;
          
          try {
            // Attempt to refresh the token
            const refreshEndpoint = `${apiConfig.API_URL}${apiConfig.ENDPOINTS.AUTH.REFRESH_TOKEN}`;
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
              return apiClient(config);
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

export default apiClient;