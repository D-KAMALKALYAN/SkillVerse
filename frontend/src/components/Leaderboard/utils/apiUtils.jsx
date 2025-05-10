/**
 * Enhanced API Utilities for Leaderboard
 * 
 * Integrates with apiConfig and apiClient for better error handling,
 * automatic token management, and environment-aware URL configuration.
 */

import apiConfig from '../../../path/to/apiConfig';
import apiClient, { getErrorMessage } from '../../../path/to/apiClient';

/**
 * Fetch leaderboard data with improved error handling
 * @param {Object} params - Leaderboard query parameters
 * @returns {Promise<Object>} Leaderboard data or error information
 */
export const fetchLeaderboardData = async (params) => {
  try {
    // Ensure API is initialized
    if (!apiConfig.isInitialized) {
      await apiConfig.initialize();
    }

    // Construct the query parameters
    const queryParams = new URLSearchParams({
      timeFrame: params.timeFrame || 'all',
      category: params.category || 'all',
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy || 'points',
      sortDirection: params.sortDirection || 'desc',
      search: params.searchQuery || ''
    });
    
    // Use apiClient instead of axios directly to leverage interceptors
    const response = await apiClient.get(
      `${apiConfig.ENDPOINTS.POINTS.LEADERBOARD}?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return {
        success: true,
        leaderboard: response.data.leaderboard,
        totalPages: Math.ceil(response.data.total / params.limit) || 1,
        total: response.data.total,
        error: null
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch leaderboard data');
    }
  } catch (err) {
    console.error('[Leaderboard] Error fetching leaderboard:', err);
    return {
      success: false,
      leaderboard: [],
      totalPages: 1,
      total: 0,
      error: getErrorMessage(err)
    };
  }
};

/**
 * Fetch user's rank and details with improved error handling
 * @returns {Promise<Object>} User rank data or error information
 */
export const fetchUserRankData = async () => {
  try {
    // Ensure API is initialized
    if (!apiConfig.isInitialized) {
      await apiConfig.initialize();
    }

    // Token management is handled by apiClient interceptors
    const response = await apiClient.get('/api/points/user-rank');
    
    if (response.data.success) {
      return {
        success: true,
        rank: response.data.rank,
        details: {
          points: response.data.points,
          streak: response.data.streak,
          percentile: response.data.percentile
        }
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch user rank data');
    }
  } catch (err) {
    console.error('[Leaderboard] Error fetching user rank:', err);
    
    // If not authenticated, return specific error message
    if (err.response && err.response.status === 401) {
      return {
        success: false,
        error: 'Please log in to view your ranking'
      };
    }
    
    return {
      success: false,
      error: getErrorMessage(err)
    };
  }
};

/**
 * Check if the leaderboard service is available
 * @returns {Promise<boolean>} True if service is available
 */
export const checkLeaderboardAvailability = async () => {
  try {
    // Use the health check feature from apiConfig
    return await apiConfig.checkHealth();
  } catch (error) {
    console.error('[Leaderboard] Health check failed:', error);
    return false;
  }
};

export default {
  fetchLeaderboardData,
  fetchUserRankData,
  checkLeaderboardAvailability
};