import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import { triggerRefetchUnreadCount } from "./useUnreadCount";

export const useNotifications = (initialPage = 0, limit = 10) => {
  const READ_STATUS = "Đã đọc";
  const UNREAD_STATUS = "Chưa đọc";

  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapNotification = (item) => {
    const isRead = item.isRead ?? item.is_read ?? false;
    return {
      id: item.notificationId || item.notification_id || item.id,
      title: item.title,
      message: item.body || item.message,
      description: item.body,
      status: isRead ? READ_STATUS : UNREAD_STATUS,
      date: item.createdAt || item.created_at,
      type: item.notificationType || item.notification_type,
      eventId: item.eventId || item.event_id,
      isRead,
    };
  };

  const fetchNotifications = useCallback(
    async (page) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await notificationService.getNotifications({ page, limit });
        
        // Backend returns: { data: { content: [...], page: { totalPages, totalElements, ... } }, message: "..." }
        const pageData = response?.data || {};
        const content = pageData?.content || [];
        
        // Pagination info is in response.data.page (not response.data.totalPages)
        const paginationInfo = pageData?.page || {};
        const total = paginationInfo?.totalElements ?? pageData?.totalElements ?? 0;
        const pages = paginationInfo?.totalPages ?? pageData?.totalPages ?? 1;
        
        console.log('Parsed pagination:', { contentLength: content.length, total, pages });

        setNotifications(Array.isArray(content) ? content.map(mapNotification) : []);
        setTotalElements(total);
        setTotalPages(pages > 0 ? pages : 1);
      } catch (err) {
        console.error('Fetch notifications error:', err);
        setError(err.message);
        setNotifications([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? { ...notif, status: READ_STATUS, isRead: true }
            : notif
        )
      );

      await notificationService.markAsRead(id);
      
      // Trigger refetch unread count sau khi đánh dấu đã đọc
      triggerRefetchUnreadCount();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? { ...notif, status: UNREAD_STATUS, isRead: false }
            : notif
        )
      );
      setError(error.message || "Không thể đánh dấu đã đọc thông báo");
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, status: READ_STATUS, isRead: true }))
      );

      await notificationService.markAllAsRead();
      
      // Trigger refetch unread count
      triggerRefetchUnreadCount();
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
      fetchNotifications(currentPage);
      setError(error.message || "Không thể đánh dấu tất cả đã đọc");
    }
  };

  const deleteNotification = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));

      await notificationService.deleteNotification(id);
      
      // Trigger refetch unread count
      triggerRefetchUnreadCount();
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
      fetchNotifications(currentPage);
      setError(error.message || "Không thể xóa thông báo");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      // Optimistic update
      setNotifications([]);

      await notificationService.deleteAllNotifications();
      
      // Trigger refetch unread count
      triggerRefetchUnreadCount();
    } catch (error) {
      console.error("Lỗi xóa tất cả thông báo:", error);
      fetchNotifications(currentPage);
      setError(error.message || "Không thể xóa tất cả thông báo");
    }
  };

  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    notifications,
    loading: isLoading,
    currentPage,
    totalPages,
    totalElements,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    changePage,
    refresh: () => fetchNotifications(currentPage),
  };
};
