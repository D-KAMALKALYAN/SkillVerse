/**
 * Authentication Service
 * 
 * Handles user authentication with improved error handling and connection resilience.
 */

import axios from 'axios';
import apiClient, { isNetworkError, getErrorMessage } from '../config/apiClient';
import apiConfig from '../config/apiConfig';

// Initialize API config
(async function() {
  try {
    await apiConfig.initialize();
    console.log(`[Auth] Using API endpoint: ${apiConfig.API_URL}`);
  } catch (error) {
    console.error('[Auth] API config initialization failed:', error);
  }
})();

/**
 * Check if the configured API URL is reachable
 * @returns {Promise<boolean>} True if API is reachable
 */
const checkApiHealth = async () => {
  try {
    // Use a simple health check endpoint that should exist on both environments
    // Many backends use /health, /ping, or / as simple health endpoints
    const endpoints = [
      `${apiConfig.API_URL}${apiConfig.ENDPOINTS.AUTH.HEALTH || '/health'}`,
      `${apiConfig.API_URL}/ping`,
      `${apiConfig.API_URL}/`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`[Auth] Checking API health at: ${endpoint}`);
        const response = await axios.get(endpoint, { timeout: 3000 });
        if (response.status >= 200 && response.status < 500) {
          console.log(`[Auth] API health check successful: ${response.status}`);
          return true; // Any response that's not a server error is considered successful
        }
      } catch (endpointError) {
        console.log(`[Auth] Health check failed for ${endpoint}: ${endpointError.message}`);
        // Continue to next endpoint
      }
    }
    
    // If we get here, all health checks failed
    console.warn('[Auth] All API health checks failed.');
    return false;
  } catch (error) {
    console.warn('[Auth] API health check error:', error.message);
    return false;
  }
};

/**
 * Login user
 * @param {object} credentials - User credentials (email and password)
 * @returns {Promise} Promise resolving to login result
 */
export const login = async (credentials) => {
  // Validate credentials before attempting API call
  if (!credentials.email || !credentials.password) {
    console.error('[Auth] Login failed: Missing email or password');
    throw new Error('Email and password are required');
  }
  
  console.log(`[Auth] Attempting login to: ${apiConfig.API_URL}${apiConfig.ENDPOINTS.AUTH.LOGIN}`);
  
  // First ensure API is reachable
  const isApiHealthy = await checkApiHealth();
  if (!isApiHealthy && !apiConfig.isProduction) {
    console.log('[Auth] API not reachable. Switching to production mode.');
    apiConfig.forceProductionMode();
  }
  
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store token and user info
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    console.log('[Auth] Login successful');
    return response.data;
  } catch (error) {
    // First check for network issues
    if (isNetworkError(error)) {
      console.error('[Auth] Login failed - Network error:', error.message);
      
      // Try production URL if we're not already using it
      if (!apiConfig.isProduction) {
        console.log('[Auth] Attempting login with production fallback');
        apiConfig.forceProductionMode();
        
        try {
          // Do a health check first
          const isHealthy = await checkApiHealth();
          if (!isHealthy) {
            throw new Error('Production API is not reachable');
          }
          
          // Try login again with production URL
          const retryResponse = await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGIN, credentials);
          
          // Store token and user info
          if (retryResponse.data?.token) {
            localStorage.setItem('token', retryResponse.data.token);
            
            if (retryResponse.data.refreshToken) {
              localStorage.setItem('refreshToken', retryResponse.data.refreshToken);
            }
            
            if (retryResponse.data.user) {
              localStorage.setItem('user', JSON.stringify(retryResponse.data.user));
            }
          }
          
          console.log('[Auth] Login successful with production fallback');
          return retryResponse.data;
        } catch (fallbackError) {
          console.error('[Auth] Fallback login failed:', fallbackError.message);
          throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
        }
      } else {
        throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
      }
    }
    
    // Handle specific HTTP errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`[Auth] Login failed with status ${status}:`, errorData);
      
      // Enhance error with specific user messages based on status code
      switch (status) {
        case 400:
          error.userMessage = errorData?.message || 'Invalid login credentials. Please check your email and password.';
          break;
        case 401:
          error.userMessage = 'Incorrect email or password. Please try again.';
          break;
        case 403:
          error.userMessage = 'Your account has been disabled. Please contact support.';
          break;
        case 404:
          error.userMessage = 'Login service not found. Please try again later.';
          break;
        case 429:
          error.userMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.userMessage = 'Server error. Please try again later.';
          break;
        default:
          error.userMessage = errorData?.message || getErrorMessage(error);
      }
    } else {
      error.userMessage = getErrorMessage(error);
    }
    
    console.error('[Auth] Login error:', error.userMessage);
    throw error;
  }
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise} Promise resolving to registration result
 */
export const register = async (userData) => {
  // Validate data before attempting API call
  if (!userData.email || !userData.password) {
    throw new Error('Email and password are required');
  }
  
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REGISTER, userData);
    console.log('[Auth] Registration successful');
    
    // Store token if returned with registration
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    
    // Handle specific HTTP errors
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 409:
          error.userMessage = 'Email address is already registered. Please use a different email or try to login.';
          break;
        case 400:
          error.userMessage = error.response.data?.message || 'Invalid registration data. Please check your information.';
          break;
        default:
          error.userMessage = error.response.data?.message || getErrorMessage(error);
      }
    } else {
      error.userMessage = getErrorMessage(error);
    }
    
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} Promise resolving when logout is complete
 */
export const logout = async () => {
  try {
    await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGOUT);
    console.log('[Auth] Logout successful');
  } catch (error) {
    console.warn('[Auth] Logout error:', error);
    // Continue with logout even if API call fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return true;
  }
};

/**
 * Verify if current token is valid
 * @returns {Promise} Promise resolving to user data if valid
 */
export const verifyToken = async () => {
  try {
    const response = await apiClient.get(apiConfig.ENDPOINTS.AUTH.USER);
    return response.data;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    
    // Clear token if it's invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Promise resolving to reset request result
 */
export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }
  
  try {
    const endpoint = apiConfig.ENDPOINTS.AUTH.RESET_PASSWORD || '/auth/reset-password';
    const response = await apiClient.post(endpoint, { email });
    return response.data;
  } catch (error) {
    console.error('[Auth] Password reset request error:', error);
    
    if (error.response && error.response.status === 404) {
      // Don't reveal if email exists or not for security
      return { message: 'If your email is registered, you will receive reset instructions shortly.' };
    }
    
    error.userMessage = getErrorMessage(error);
    throw error;
  }
};

/**
 * Complete password reset
 * @param {object} resetData - Password reset data including token and new password
 * @returns {Promise} Promise resolving to reset result
 */
export const completePasswordReset = async (resetData) => {
  if (!resetData.token || !resetData.password) {
    throw new Error('Reset token and new password are required');
  }
  
  try {
    const endpoint = apiConfig.ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM || '/auth/reset-password/confirm';
    const response = await apiClient.post(endpoint, resetData);
    return response.data;
  } catch (error) {
    console.error('[Auth] Password reset completion error:', error);
    
    // Handle specific errors
    if (error.response) {
      switch (error.response.status) {
        case 400:
          error.userMessage = error.response.data?.message || 'Invalid or expired reset token. Please request a new password reset.';
          break;
        default:
          error.userMessage = error.response.data?.message || getErrorMessage(error);
      }
    } else {
      error.userMessage = getErrorMessage(error);
    }
    
    throw error;
  }
};