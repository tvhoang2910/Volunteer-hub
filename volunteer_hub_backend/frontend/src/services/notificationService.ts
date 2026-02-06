/**
 * @file notificationService.js
 * @description Service for handling general system notifications (not limited to manager).
 * Includes fetching notifications and marking them as read.
 * 
 * API Endpoints (Backend):
 * - GET /api/notifications - Lấy danh sách thông báo (userId từ JWT)
 * - GET /api/notifications/unread-count - Đếm số thông báo chưa đọc
 * - PUT /api/notifications/{id}/read - Đánh dấu 1 thông báo đã đọc
 * - PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
 * - DELETE /api/notifications/{id} - Xóa 1 thông báo
 * - DELETE /api/notifications/all - Xóa tất cả thông báo
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const notificationService = {
  /**
   * Lấy danh sách thông báo của user hiện tại (userId từ JWT token)
   * GET /api/notifications?page=0&limit=10&isRead=false
   */
  async getNotifications({ page = 0, limit = 10, isRead }: { page?: number; limit?: number; isRead?: boolean } = {}) {
    try {
      const params: any = { page, limit };
      if (isRead !== undefined) {
        params.isRead = isRead;
      }

      const response = await axios.get(
        `${API_URL}/api/notifications`,
        {
          params,
          headers: getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get Notifications Error:", error);
      throw error;
    }
  },

  /**
   * Đếm số lượng thông báo chưa đọc
   * GET /api/notifications/unread-count
   */
  async getUnreadCount() {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications/unread-count`,
        {
          headers: getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get Unread Count Error:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   * PUT /api/notifications/{notificationId}/read
   */
  async markAsRead(notificationId: string) {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * PUT /api/notifications/read-all
   */
  async markAllAsRead() {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw error;
    }
  },

  /**
   * Xóa 1 thông báo
   * DELETE /api/notifications/{notificationId}
   */
  async deleteNotification(notificationId: string) {
    try {
      const response = await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  },

  /**
   * Xóa tất cả thông báo
   * DELETE /api/notifications/all
   */
  async deleteAllNotifications() {
    try {
      const response = await axios.delete(
        `${API_URL}/api/notifications/all`,
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Delete all notifications error:", error);
      throw error;
    }
  },

  // ==================== LEGACY METHODS (for backward compatibility) ====================

  /**
   * @deprecated Use getNotifications() instead
   * Legacy method - userId is now extracted from JWT token
   */
  async getUserNotifications(userId: string, options: { page?: number; limit?: number; isRead?: boolean } = {}) {
    console.warn('getUserNotifications is deprecated, use getNotifications() instead');
    return this.getNotifications(options);
  },
};
