/**
 * Authentication Service
 * 
 * Handles user authentication with improved error handling and connection resilience.
 */
import apiClient, { isNetworkError, getErrorMessage, checkApiHealth } from '../config/apiClient';
import apiConfig from '../config/apiConfig';
import axios from 'axios';

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
  
  // Check API health before attempting login
  const isHealthy = await checkApiHealth();
  if (!isHealthy && !apiConfig.isProduction) {
    console.log('[Auth] Development API not available, switching to production');
    apiConfig.forceProductionMode();
  } else if (!isHealthy) {
    console.warn('[Auth] API health check failed, but proceeding with login attempt');
  }
  
  // The endpoint path relative to the base URL
  const loginEndpoint = `${apiConfig.ENDPOINTS.AUTH.LOGIN}`;
  console.log(`[Auth] Attempting login with endpoint: ${loginEndpoint}`);
  
  try {
    // Use apiClient which already has the base URL configured
    const response = await apiClient.post(loginEndpoint, credentials);
    
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
        
        // Switch to production mode
        apiConfig.forceProductionMode();
        
        try {
          // Try login again with updated API config
          const retryResponse = await apiClient.post(loginEndpoint, credentials);
          
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
          
          // Try direct axios call as last resort
          try {
            console.log('[Auth] Attempting direct axios call to bypass apiClient');
            const directUrl = `${apiConfig.API_URL}${loginEndpoint}`;
            
            const directResponse = await axios.post(directUrl, credentials, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              withCredentials: true,
              timeout: 20000 // Extended timeout for last resort
            });
            
            // Store token and user info
            if (directResponse.data?.token) {
              localStorage.setItem('token', directResponse.data.token);
              
              if (directResponse.data.refreshToken) {
                localStorage.setItem('refreshToken', directResponse.data.refreshToken);
              }
              
              if (directResponse.data.user) {
                localStorage.setItem('user', JSON.stringify(directResponse.data.user));
              }
            }
            
            console.log('[Auth] Login successful with direct axios call');
            return directResponse.data;
          } catch (directError) {
            console.error('[Auth] All login attempts failed:', directError.message);
            throw new Error(getErrorMessage(directError) || 'Login failed after multiple attempts');
          }
        }
      } else {
        // Already in production mode, throw with clear message
        throw new Error('Unable to connect to the authentication server. Please check your internet connection.');
      }
    } else {
      // Handle non-network errors (server errors, validation errors, etc)
      const errorMessage = getErrorMessage(error);
      console.error('[Auth] Login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise} Promise resolving to registration result
 */
export const register = async (userData) => {
  // Validate required fields
  if (!userData.email || !userData.password || !userData.name) {
    console.error('[Auth] Registration failed: Missing required fields');
    throw new Error('Name, email and password are required');
  }
  
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REGISTER, userData);
    
    // Some APIs automatically log in the user after registration
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    console.log('[Auth] Registration successful');
    return response.data;
  } catch (error) {
    // Handle registration errors with user-friendly messages
    if (error.response?.status === 409) {
      throw new Error('This email is already registered. Please try logging in instead.');
    }
    
    const errorMessage = getErrorMessage(error);
    console.error('[Auth] Registration failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Log out the current user
 * @returns {Promise} Promise resolving when logout is complete
 */
export const logout = async () => {
  try {
    // Only call the logout endpoint if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGOUT);
        console.log('[Auth] Logout API call successful');
      } catch (error) {
        // We still want to clear local storage even if the API call fails
        console.warn('[Auth] Logout API call failed, but proceeding with local logout:', error.message);
      }
    }
    
    // Clean up local storage regardless of API success
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    console.log('[Auth] User logged out');
    return true;
  } catch (error) {
    console.error('[Auth] Error during logout:', error);
    
    // Still clear storage even on error
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return true;
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise} Promise resolving to user data
 */
export const getCurrentUser = async () => {
  // First check if we have the user in localStorage
  const userJson = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('[Auth] No token found, user is not authenticated');
    return null;
  }
  
  try {
    // Always verify with the server to ensure token is still valid
    const response = await apiClient.get(apiConfig.ENDPOINTS.AUTH.USER);
    
    // Update the stored user data if it has changed
    const freshUserData = response.data.user || response.data;
    localStorage.setItem('user', JSON.stringify(freshUserData));
    
    console.log('[Auth] Current user retrieved successfully');
    return freshUserData;
  } catch (error) {
    console.error('[Auth] Failed to get current user:', error.message);
    
    // If we get 401 or 403, token is invalid/expired so we should clear it
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('[Auth] Token invalid, clearing authentication data');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
    
    // For network errors, if we have user data cached, return that
    if (isNetworkError(error) && userJson) {
      console.log('[Auth] Network error, using cached user data');
      try {
        return JSON.parse(userJson);
      } catch (parseError) {
        console.error('[Auth] Error parsing cached user data:', parseError);
        return null;
      }
    }
    
    // Otherwise, we have no user
    return null;
  }
};

/**
 * Request password reset
 * @param {string} email - User's email address
 * @returns {Promise} Promise resolving to the response data
 */
export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }
  
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    console.log('[Auth] Password reset requested successfully');
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('[Auth] Password reset request failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Confirm password reset with token and new password
 * @param {object} resetData - Contains token, newPassword and confirmPassword
 * @returns {Promise} Promise resolving to the response data
 */
export const confirmPasswordReset = async (resetData) => {
  if (!resetData.token || !resetData.newPassword || !resetData.confirmPassword) {
    throw new Error('Token and passwords are required');
  }
  
  if (resetData.newPassword !== resetData.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  try {
    const response = await apiClient.post(
      apiConfig.ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, 
      resetData
    );
    console.log('[Auth] Password reset confirmed successfully');
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('[Auth] Password reset confirmation failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Refresh authentication token
 * @returns {Promise} Promise resolving to new token
 */
export const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  
  if (!refreshTokenValue) {
    console.error('[Auth] No refresh token available');
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken: refreshTokenValue
    });
    
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      
      // Update refresh token if provided
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      console.log('[Auth] Token refreshed successfully');
      return response.data;
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error.message);
    
    // Clear tokens on refresh failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get user from local storage
 * @returns {object|null} User object or null if not found
 */
export const getStoredUser = () => {
  try {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('[Auth] Error parsing stored user:', error);
    return null;
  }
};

// Export auth service methods
const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  requestPasswordReset,
  confirmPasswordReset,
  refreshToken,
  isAuthenticated,
  getStoredUser
};

export default authService;