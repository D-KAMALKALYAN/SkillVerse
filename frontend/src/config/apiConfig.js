/**
 * API Configuration
 * 
 * Handles environment-specific API configuration with better
 * detection and fallback mechanisms.
 */

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
    HEALTH: '/health', // Make sure this endpoint exists on your backend
    RESET_PASSWORD: '/auth/reset-password',
    RESET_PASSWORD_CONFIRM: '/auth/reset-password/confirm',
  }
};

// Config object to export
const apiConfig = {
  API_URL: '',
  BACKEND_URL: '',
  ENDPOINTS,
  isInitialized: false,
  isProduction: false,
  
  /**
   * Initialize API configuration based on environment
   */
  async initialize() {
    if (this.isInitialized) return;
    
    // Determine environment
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    const isLocalURL = 
      window.location.hostname.includes('.local') || 
      window.location.hostname.includes('.test');
      
    const isDevelopmentMode = 
      process.env.NODE_ENV === 'development' || 
      window.location.hostname.includes('dev.');
    
    console.log(`Environment detection: isLocalhost=${isLocalhost}, isLocalURL=${isLocalURL}, isDevelopmentMode=${isDevelopmentMode}`);
    
    // Default to development if on localhost/development, otherwise production
    const environment = (isLocalhost || isLocalURL || isDevelopmentMode) 
      ? ENVIRONMENTS.DEVELOPMENT 
      : ENVIRONMENTS.PRODUCTION;
    
    this.API_URL = environment.API_URL;
    this.BACKEND_URL = environment.BACKEND_URL;
    this.isProduction = environment === ENVIRONMENTS.PRODUCTION;
    
    console.log(`[API] Using ${this.isProduction ? 'production' : 'development'} API endpoint: ${this.API_URL}`);
    console.log(`[API] Backend URL: ${this.BACKEND_URL}`);
    
    this.isInitialized = true;
    return this;
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
    
    return this;
  }
};

// Initialize on import
apiConfig.initialize();

export default apiConfig;