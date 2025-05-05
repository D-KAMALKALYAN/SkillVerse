/**
 * Authentication API functions
 */
import apiClient from '../config/apiClient'; // Import the apiClient instance, not just 'api'

export const register = async (credentials) => {
  const response = await apiClient.post('/api/auth/register', credentials);
  return response.data;
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    console.log("Login API Response:", response.data); // Debugging
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};