/**
 * API Service
 * 
 * Centralized API functions using apiConfig and apiClient for
 * handling user profiles, skills, and account management.
 */

import apiConfig from '../config/apiConfig';
import apiClient, { getErrorMessage } from '../config/apiClient';

/**
 * Fetch complete user profile including skills and account details
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User profile data
 */
export const fetchUserProfile = async (userId) => {
  try {
    // First, fetch skills
    const skillsResponse = await apiClient.get(`/skills/${userId}`);
    const skillsData = skillsResponse.data;

    // Then, fetch user details
    const userResponse = await apiClient.get(`/users/${userId}`);
    const userData = userResponse.data;

    return {
      teachingSkills: skillsData.teachingSkills || [], 
      learningSkills: skillsData.learningSkills || [],
      name: userData.name || '',
      email: userData.email || '',
      country: userData.country || '',
      hasSecurityQuestions: userData.securityQuestions && userData.securityQuestions.length > 0,
      joinedDate: userData.createdAt || new Date(),
      matchesCompleted: userData.matchesCompleted || 0,
      securityQuestions: userData.securityQuestions || []
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Add a new skill to the user's profile
 * @param {Object} skillData - Skill data to add
 * @returns {Promise<Object>} Added skill data
 */
export const addSkill = async (skillData) => {
  try {
    const response = await apiClient.post('/skills', skillData);
    return response.data;
  } catch (error) {
    console.error('Error adding skill:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Remove a skill and its associated matches
 * @param {string} skillId - ID of the skill to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeSkill = async (skillId) => {
  try {
    // First, delete the skill
    await apiClient.delete(`/skills/${skillId}`);

    // Then, delete any matches associated with this skill
    await apiClient.delete(`/matches/by-skill/${skillId}`);
    
    return true;
  } catch (error) {
    console.error('Error removing skill:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Update user profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/profile/update', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Update security questions for password recovery
 * @param {Array} securityQuestions - Array of security questions and answers
 * @returns {Promise<Object>} Updated security questions data
 */
export const updateSecurityQuestions = async (securityQuestions) => {
  try {
    const response = await apiClient.put('/profile/security-questions', { securityQuestions });
    return response.data;
  } catch (error) {
    console.error('Error updating security questions:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Health check to verify API connectivity
 * @returns {Promise<boolean>} API health status
 */
export const checkApiStatus = async () => {
  try {
    return await apiConfig.checkHealth();
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Export the full API config for direct access if needed
export { apiConfig, apiClient };