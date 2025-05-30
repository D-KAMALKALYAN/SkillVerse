/**
 * Utility functions for the Assessment Dashboard
 * These functions handle API requests and data processing for dashboard components
 * 
 * Refactored to use apiClient and apiConfig for better consistency and error handling
 */

import apiClient from '../../config/apiClient';
import apiConfig from '../../config/apiConfig';

/**
 * Fetch assessment statistics for a specific skill
 * @param {string} skillId - The ID of the skill to fetch stats for
 * @returns {Promise<Object>} The assessment stats data
 */
export const fetchAssessmentStats = async (skillId) => {
  try {
    console.log("Fetching stats for skillId:", skillId);
    
    const endpoint = `/assessments/${skillId}/assessment-stats`;
    const response = await apiClient.get(endpoint, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    console.log("Assessment stats response status:", response.status);

    if (response.status === 200 && response.data) {
      const statsData = response.data;
      console.log("Stats data received:", statsData);
      
      if (statsData && statsData.success && statsData.stats) {
        return {
          totalAssessments: statsData.stats.totalAssessments || 0,
          pendingSubmissions: statsData.stats.pendingSubmissions || 0,
          completedSubmissions: statsData.stats.completedSubmissions || 0,
          averageScore: statsData.stats.averageScore || 0
        };
      } else {
        console.warn("Stats data format unexpected:", statsData);
        return null;
      }
    } else {
      console.warn("Failed to fetch stats:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching assessment stats:", error);
    console.error("Error details:", apiConfig.getErrorMessage ? apiConfig.getErrorMessage(error) : error.message);
    return null;
  }
};

/**
 * Fetch general assessment statistics when no skill ID is specified
 * @returns {Promise<Object>} The general assessment stats data
 */
export const fetchGeneralStats = async () => {
  try {
    console.log("Fetching general stats");
    
    const endpoint = `/assessments/general-stats`;
    const response = await apiClient.get(endpoint, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    if (response.status === 200 && response.data) {
      const generalStatsData = response.data;
      
      if (generalStatsData && generalStatsData.success && generalStatsData.stats) {
        return {
          totalAssessments: generalStatsData.stats.totalAssessments || 0,
          pendingSubmissions: generalStatsData.stats.pendingSubmissions || 0,
          completedSubmissions: generalStatsData.stats.completedSubmissions || 0,
          averageScore: generalStatsData.stats.averageScore || 0
        };
      }
    }
    
    // Return default stats if API call fails or data is missing
    return {
      totalAssessments: 0,
      pendingSubmissions: 0,
      completedSubmissions: 0,
      averageScore: 0
    };
  } catch (error) {
    console.error("Error fetching general stats:", error);
    console.error("Error details:", apiConfig.getErrorMessage ? apiConfig.getErrorMessage(error) : error.message);
    return {
      totalAssessments: 0,
      pendingSubmissions: 0,
      completedSubmissions: 0,
      averageScore: 0
    };
  }
};

/**
 * Fetch completed teaching sessions for a user
 * @param {string} userId - The ID of the user to fetch sessions for
 * @returns {Promise<Array>} The list of completed teaching sessions
 */
export const fetchCompletedSessions = async (userId) => {
  try {
    if (!userId) {
      console.warn("No userId provided to fetchCompletedSessions");
      return [];
    }
    
    const endpoint = `/sessions/user/${userId}`;
    const response = await apiClient.get(endpoint, {
      params: {
        status: ['completed', 'scheduled']
      },
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    if (!response || response.status !== 200) {
      throw new Error(`Failed to fetch sessions: ${response ? response.status : 'No response'}`);
    }
    
    const sessionsData = response.data;
    
    // Filter sessions where user is the teacher
    if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
      const teachingSessions = sessionsData.sessions.filter(session => {
        const sessionTeacherId = typeof session.teacherId === 'object' ? 
          session.teacherId._id || session.teacherId.$oid : session.teacherId;
        const userIdForComparison = userId.$oid || userId;
        
        return (session.status === 'completed' || session.status === 'scheduled') && 
              sessionTeacherId === userIdForComparison;
      });
      
      return teachingSessions;
    } else {
      console.error('Sessions data is not in expected format:', sessionsData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    console.error("Error details:", apiConfig.getErrorMessage ? apiConfig.getErrorMessage(error) : error.message);
    return [];
  }
};

/**
 * Format statistics for display
 * @param {number|string} value - The value to format
 * @param {boolean} isPercentage - Whether to format as percentage
 * @returns {string} The formatted value
 */
export const formatStat = (value, isPercentage = false) => {
  if (value === null || value === undefined) return isPercentage ? '0%' : '0';
  if (isPercentage) {
    // Format as percentage with one decimal place
    return `${parseFloat(value).toFixed(1)}%`;
  }
  return value.toString();
};

/**
 * Check if a session already has an assessment
 * @param {string} sessionId - The ID of the session to check
 * @param {Array} existingAssessments - The list of existing assessments
 * @returns {boolean} Whether the session has an existing assessment
 */
export const hasExistingAssessment = (sessionId, existingAssessments) => {
  if (!existingAssessments || !Array.isArray(existingAssessments)) return false;
  return existingAssessments.some(assessment => 
    assessment.sessionId === sessionId || 
    (assessment.sessionId && typeof assessment.sessionId === 'object' && assessment.sessionId._id === sessionId)
  );
};

/**
 * Format a date from ISO string to a readable format
 * @param {string} dateString - The ISO date string
 * @returns {string} Formatted date string (e.g., "Apr 19, 2025")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Calculate session duration from start and end times or duration property
 * @param {Object} session - The session object
 * @returns {string} Formatted duration string
 */
export const calculateSessionDuration = (session) => {
  if (!session) return 'N/A';
  
  if (session.duration) {
    return `${session.duration} minutes`;
  } else if (session.startTime && session.endTime) {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    if (!isNaN(startTime) && !isNaN(endTime)) {
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
      return `${durationMinutes} minutes`;
    }
  }
  
  return 'N/A';
};

/**
 * Extract the session title from potentially nested objects
 * @param {Object} session - The session object
 * @returns {string} The session title
 */
export const getSessionTitle = (session) => {
  return session.title || 
         (session.skillDetails && session.skillDetails.title) || 
         (session.skillId && typeof session.skillId === 'object' && session.skillId.title) ||
         'Skill Session';
};

/**
 * Extract the student name from potentially nested objects
 * @param {Object} session - The session object
 * @returns {string} The student name
 */
export const getStudentName = (session) => {
  return session.studentName || 
         (session.learnerDetails && session.learnerDetails.name) ||
         (session.studentId && typeof session.studentId === 'object' && session.studentId.name) ||
         'Student';
};

/**
 * Extract time (HH:MM) from an ISO date string
 * @param {string} dateString - The ISO date string
 * @returns {string} Time string (e.g., "14:30")
 */
export const extractTimeFromDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date)) return 'N/A';
  
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

/**
 * Health check for dashboard functionality
 * @returns {Promise<boolean>} True if API is reachable
 */
export const checkDashboardHealth = async () => {
  try {
    if (apiConfig.checkHealth) {
      return await apiConfig.checkHealth();
    } else {
      // Fall back to a simple health check if apiConfig doesn't have one
      const response = await apiClient.get('/health');
      return response.status === 200;
    }
  } catch (error) {
    console.error('Dashboard health check failed:', error.message);
    return false;
  }
};