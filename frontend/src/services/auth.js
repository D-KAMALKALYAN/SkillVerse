import apiClient from '../config/apiClient';
import apiConfig from '../config/apiConfig';

/**
 * Login user with email and password
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  } catch (error) {
    // Get the specific error message directly from the response
    if (error.response && error.response.data && error.response.data.msg) {
      throw new Error(error.response.data.msg);
    }
    
    // If no specific message, throw the original error
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data and token
 */
export const register = async (userData) => {
  const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REGISTER, userData);
  return response.data;
};

/**
 * Request password reset email
 * @param {Object} email - User email
 * @returns {Promise<Object>} - Success message
 */
export const forgotPassword = async (email) => {
  const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  return response.data;
};

/**
 * Reset password with token
 * @param {Object} resetData - Password reset data
 * @param {string} resetData.token - Reset token
 * @param {string} resetData.password - New password
 * @returns {Promise<Object>} - Success message
 */
export const resetPassword = async (resetData) => {
  const response = await apiClient.post(
    `${apiConfig.ENDPOINTS.AUTH.RESET_PASSWORD}/${resetData.token}`, 
    { password: resetData.password }
  );
  return response.data;
};

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Success message
 */
export const verifyEmail = async (token) => {
  const response = await apiClient.get(`${apiConfig.ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`);
  return response.data;
};

/**
 * Gets the current user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get(apiConfig.ENDPOINTS.AUTH.ME);
  return response.data;
};

/**
 * Updates the current user profile
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (userData) => {
  const response = await apiClient.put(apiConfig.ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
  return response.data;
};

/**
 * Changes the user's password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} - Success message
 */
export const changePassword = async (passwordData) => {
  const response = await apiClient.put(apiConfig.ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  return response.data;
};

/**
 * Refreshes the auth token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New auth token
 */
export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  return response.data;
};

/**
 * Gets OAuth2 login URL for specified provider
 * @param {string} provider - Provider name (google, facebook, etc)
 * @returns {string} - OAuth2 login URL
 */
export const getOAuthLoginUrl = (provider) => {
  return `${apiConfig.API_URL}${apiConfig.ENDPOINTS.AUTH.OAUTH}/${provider}`;
};

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  updateProfile,
  changePassword,
  refreshToken,
  getOAuthLoginUrl
};