import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import { triggerRefetchUnreadCount } from "./useUnreadCount";

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    message?: string;
    isRead: boolean;
    createdAt: string;
    time: string;
    eventId?: string;
    // UI display properties
    unread?: boolean;
    status?: string;
}

export function useManagerNotifications(initialPage = 0, limit = 10) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await notificationService.getNotifications({ page, limit });
            
            // Handle API response structure
            // Backend returns: { message, data: Page<NotificationResponseDTO>, detail }
            // Page has: { content: [...], totalElements, totalPages, ... }
            const pageData = response?.data || response || {};
            const content = pageData?.content || (Array.isArray(pageData) ? pageData : []);
            
            // Update pagination info
            setTotalElements(pageData?.totalElements || content.length || 0);
            setTotalPages(pageData?.totalPages || (content.length > 0 ? 1 : 0));
            
            // Transform notifications for UI display
            // Backend DTO: { notificationId, recipientId, eventId, title, body, notificationType, isRead, createdAt }
            const transformedNotifications = content.map((n: any) => ({
                id: n.notificationId || n.id,
                type: n.notificationType || n.type,
                title: n.title,
                body: n.body || n.message || "",
                message: n.body || n.message || "",
                isRead: n.isRead,
                createdAt: n.createdAt,
                time: formatTime(n.createdAt),
                eventId: n.eventId,
                unread: !n.isRead,
                // Map notification type to status for UI icons
                status: mapTypeToStatus(n.notificationType || n.type),
            }));
            
            setNotifications(transformedNotifications);
        } catch (err: any) {
            console.error("Failed to fetch notifications:", err);
            setError(err.message || "Không thể tải thông báo");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage, fetchNotifications]);

    // Mark single notification as read
    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, unread: false, isRead: true } : n))
            );
            // Trigger refetch unread count
            triggerRefetchUnreadCount();
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, isRead: true })));
            // Trigger refetch unread count
            triggerRefetchUnreadCount();
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    }, []);

    // Refresh notifications
    const refresh = useCallback(() => {
        fetchNotifications(currentPage);
    }, [currentPage, fetchNotifications]);

    // Change page
    const changePage = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return { 
        notifications, 
        loading, 
        error, 
        currentPage,
        totalPages,
        totalElements,
        markAsRead, 
        markAllAsRead, 
        changePage,
        refresh 
    };
}

/**
 * Map notification type to status for UI display
 */
function mapTypeToStatus(type: string): string {
    switch (type) {
        case "REGISTRATION_SUBMITTED":
            return "pending";
        case "REGISTRATION_APPROVED":
        case "REGISTRATION_CONFIRMED":
            return "approved";
        case "REGISTRATION_REJECTED":
            return "removed";
        case "REGISTRATION_COMPLETED":
        case "COMPLETION_MARKED":
            return "completed";
        case "EVENT_CREATED":
            return "success";
        case "EVENT_REMINDER":
            return "upcoming";
        case "SYSTEM":
            return "info";
        default:
            return "info";
    }
}

/**
 * Format time for display
 * Converts ISO date string to relative time or formatted date
 */
function formatTime(dateString: string): string {
    if (!dateString) return "";
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        // Format as date for older notifications
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
}
