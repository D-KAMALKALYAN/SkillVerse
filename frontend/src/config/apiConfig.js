/**
 * API Configuration File
 * 
 * This file configures the base URL for all API calls and includes
 * environment detection to automatically switch between development
 * and production endpoints.
 */

// Detect environment based on hostname
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('192.168.');

// Define API URLs
const PROD_URL = "https://skillverse-backend.onrender.com";
const DEV_URL = "http://localhost:4000";

// Read from environment variables if available (fallback to our defaults)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (isLocalhost ? DEV_URL : PROD_URL);
const API_URL = process.env.REACT_APP_API_URL || `${BACKEND_URL}/api`;

// Log selected environment during development
if (process.env.NODE_ENV !== 'production') {
  console.log(`[API] Using ${isLocalhost ? 'development' : 'production'} API endpoint: ${API_URL}`);
}

// Export configuration object
const apiConfig = {
  BASE_URL: BACKEND_URL,
  API_URL: API_URL,
  
  // Add endpoints here for easier reference
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh-token',
      USER: '/auth/user'
    },
    USERS: '/users',
    POINTS: {
      USER_POINTS: '/points/user-points',
      LEADERBOARD: '/points/leaderboard',
      CHECKIN: '/points/checkin'
    },
    MATCHES: {
      GENERATE: '/matches/generate'
    },
    SESSIONS: {
      COMPLETED: '/sessions/completed'
    },
    SKILLS: '/skills'
  },
  
  // Helper function to build full URLs
  getUrl: (endpoint) => `${API_URL}${endpoint}`
};

/**
 * Usage:
 * 
 * 1. Import in any file that makes API calls:
 *    import apiConfig from '../path/to/apiConfig';
 * 
 * 2. Use with axios:
 *    axios.get(apiConfig.getUrl(apiConfig.ENDPOINTS.USERS));
 * 
 * 3. Or create an axios instance:
 *    const apiClient = axios.create({ baseURL: apiConfig.API_URL });
 *    apiClient.get(apiConfig.ENDPOINTS.USERS);
 * 
 * 4. Access base URLs directly:
 *    const backendUrl = apiConfig.BASE_URL;
 */

export default apiConfig;