import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";

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
        const response = await notificationService.getNotifications(page, limit);

        const content = response.data?.content || response || [];
        const total = response.totalElements || response.length || 0;

        setNotifications(Array.isArray(content) ? content.map(mapNotification) : []);
        setTotalElements(total);
        setTotalPages(total > 0 ? Math.ceil(total / limit) : 1);
      } catch (err) {
        setError(err.message);
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

  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    notifications,
    currentPage,
    totalPages,
    totalElements,
    isLoading,
    error,
    markAsRead,
    changePage,
    refresh: () => fetchNotifications(currentPage),
  };
};
