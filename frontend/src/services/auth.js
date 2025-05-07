/**
 * Authentication API functions
 */
import apiClient from '../config/apiClient'; // Import the apiClient instance
import apiConfig from '../config/apiConfig'; // Also import apiConfig for direct URL access

// Helper function to ensure we're using the production URL in deployed environments
const ensureCorrectApiUrl = () => {
  // If we're not on localhost but the API URL includes localhost, force production mode
  if (!window.location.hostname.includes('localhost') && apiConfig.API_URL.includes('localhost')) {
    console.warn('[Auth] Detected misconfigured API URL. Forcing production mode.');
    apiConfig.forceProductionMode();
  }
};

export const register = async (credentials) => {
  ensureCorrectApiUrl();
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REGISTER, credentials);
    return response.data;
  } catch (error) {
    console.error("Register API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  ensureCorrectApiUrl();
  try {
    console.log(`[Auth] Attempting login to: ${apiConfig.API_URL}${apiConfig.ENDPOINTS.AUTH.LOGIN}`);
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGIN, credentials);
    console.log("[Auth] Login successful:", response.data);
    
    // Store tokens if they exist in the response
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (error.response) {
      console.error(`[Auth] Login failed with status ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("[Auth] Login failed - No response received. API URL:", apiConfig.API_URL);
      
      // Attempt direct fetch as a fallback to check server availability
      try {
        const prodUrl = "https://skillverse-backend.onrender.com/api/health";
        console.log(`[Auth] Attempting fallback health check to: ${prodUrl}`);
        fetch(prodUrl)
          .then(response => {
            console.log(`[Auth] Fallback health check response: ${response.status}`);
          })
          .catch(err => {
            console.error("[Auth] Fallback health check failed:", err);
          });
      } catch (fallbackError) {
        console.error("[Auth] Fallback check also failed");
      }
    } else {
      console.error("[Auth] Login Error:", error.message);
    }
    throw error;
  }
};

export const logout = async () => {
  ensureCorrectApiUrl();
  try {
    // Attempt to call logout endpoint
    await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.warn("[Auth] Logout API call failed:", error.message);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear local storage tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

export const checkAuthStatus = async () => {
  ensureCorrectApiUrl();
  try {
    // Check if we have a token
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthenticated: false };
    }
    
    // Verify token is valid by fetching user data
    const response = await apiClient.get(apiConfig.ENDPOINTS.AUTH.USER);
    return { 
      isAuthenticated: true, 
      user: response.data 
    };
  } catch (error) {
    // If auth check fails, clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    return { isAuthenticated: false };
  }
};

export const refreshAuthToken = async () => {
  ensureCorrectApiUrl();
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REFRESH, { refreshToken });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Auth] Token refresh failed:", error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return false;
  }
};