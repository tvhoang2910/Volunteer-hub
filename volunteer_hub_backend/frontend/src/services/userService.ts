/**
 * @file userService.ts
 * @description Service for managing user accounts and profiles.
 */
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Create axios instance with timeout and error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[UserService] API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.code === 'ECONNABORTED') {
      console.error('[UserService] Request timeout');
      throw new Error('Yêu cầu hết thời gian. Vui lòng thử lại.');
    }
    if (!error.response) {
      console.error('[UserService] Network error:', error.message);
      throw new Error('Không thể kết nối đến máy chủ.');
    }
    // Extract backend error message if available
    const backendMessage = error.response?.data?.message || error.response?.data?.detail;
    if (backendMessage) {
      const customError = new Error(backendMessage);
      customError.response = error.response;
      throw customError;
    }
    throw error;
  }
);

export const userService = {
  /**
   * Get current authenticated user profile
   * Backend extracts userId from JWT token
   */
  getUserById: async () => {
    const token = localStorage.getItem("token");
    console.log('[UserService] getUserById - token exists:', !!token);
    console.log('[UserService] getUserById - calling /api/users');
    
    const response = await apiClient.get(`/api/users`, {
      headers: getAuthHeader(),
    });
    
    console.log('[UserService] getUserById - response:', response.data);
    return response.data;
  },

  /**
   * Upload user avatar
   * @param {FormData} formData - Contains the file
   */
  uploadAvatar: async (formData: FormData) => {
    const response = await apiClient.post(
      `/api/upload/avatar`,
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
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.post(
      `/api/auth/change-password`,
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
    const response = await apiClient.delete(`/api/users/me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  /**
   * Update user profile
   * Backend gets userId from JWT token, no need to pass in URL
   * @param {Object} profileData - Profile fields to update
   */
  updateUserProfile: async (profileData: Record<string, any>) => {
    const response = await apiClient.put(
      `/api/users/profile`,
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
   * Delete (deactivate) current authenticated account.
   * Backend uses userId from JWT.
   */
  deleteUserAccount: async () => {
    const response = await apiClient.delete(`/api/users/me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
