/**
 * @file userService.js
 * @description Service for managing user accounts and profiles.
 */
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const userService = {
  /**
   * Get user by ID
   * @param {string} userId
   */
  getUserById: async (userId) => {
    // Backend endpoint /api/users returns current authenticated user's profile
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  /**
   * Upload user avatar
   * @param {FormData} formData - Contains the file
   */
  uploadAvatar: async (formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/upload/avatar`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Change user password
   * Uses auth/change-password endpoint
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  changePassword: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/change-password`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  /**
   * Deactivate user account
   */
  deactivateAccount: async () => {
    const response = await axios.delete(`${API_BASE_URL}/api/users/me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  /**
   * Update user profile
   * Backend gets userId from JWT token, no need to pass in URL
   * @param {Object} profileData - { firstName, lastName, email, etc. }
   */
  updateUserProfile: async (profileData) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/users/profile`,
      profileData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete user account
   * @param {string} userId
   */
  deleteUserAccount: async (userId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
