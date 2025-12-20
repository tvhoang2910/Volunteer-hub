/**
 * @file notificationService.js
 * @description Service for handling general system notifications (not limited to manager).
 * Includes fetching notifications and marking them as read.
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const notificationService = {
  /**
   * Lấy danh sách thông báo của user với phân trang
   */
  async getUserNotifications(userId: string, { page = 0, limit = 10, isRead }: { page?: number; limit?: number; isRead?: boolean } = {}) {
    try {
      const params: any = { page, limit };
      if (isRead !== undefined) {
        params.isRead = isRead;
      }

      const response = await axios.get(
        `${API_URL}/api/notifications/${userId}`,
        {
          params,
          headers: getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get User Notifications Error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách thông báo chung (của user hiện tại từ token)
   */
  async getNotifications(page = 0, limit = 10) {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications`,
        {
          params: { page, limit },
          headers: getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Notification Service Error:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId, userId) {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read/${userId}`,
        {},
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  },
};
