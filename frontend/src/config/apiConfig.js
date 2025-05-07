/**
 * API Configuration File
 * 
 * This file configures the base URL for all API calls and includes
 * environment detection to automatically switch between development
 * and production endpoints.
 */

// Detect environment more reliably
const isLocalDevelopment = () => {
  // Check if we're in a local development environment
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.');
  
  // Check if we're accessing the app via a local URL
  const isLocalURL = window.location.href.includes('localhost') || 
                    window.location.href.includes('127.0.0.1') ||
                    window.location.href.includes('192.168.');
                    
  // Additional checks to ensure we're in development mode
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  
  // Log for debugging purposes
  console.log(`Environment detection: isLocalhost=${isLocalhost}, isLocalURL=${isLocalURL}, isDevelopmentMode=${isDevelopmentMode}`);
  
  return isLocalhost && isLocalURL;
};

// Define API URLs - make sure PROD_URL is correct
const PROD_URL = "https://skillverse-backend.onrender.com";
const DEV_URL = "http://localhost:4000";

// Determine which environment to use
const useDevEnvironment = isLocalDevelopment();

// Set backend URL - prioritize environment variables, fallback to our local/prod logic
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (useDevEnvironment ? DEV_URL : PROD_URL);
const API_URL = process.env.REACT_APP_API_URL || `${BACKEND_URL}/api`;

// Log selected environment for debugging
console.log(`[API] Using ${useDevEnvironment ? 'development' : 'production'} API endpoint: ${API_URL}`);
console.log(`[API] Backend URL: ${BACKEND_URL}`);

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

// Add a method to force production mode if needed
apiConfig.forceProductionMode = () => {
  apiConfig.BASE_URL = PROD_URL;
  apiConfig.API_URL = `${PROD_URL}/api`;
  console.log(`[API] Forced production mode: ${apiConfig.API_URL}`);
  return apiConfig;
};

export default apiConfig;