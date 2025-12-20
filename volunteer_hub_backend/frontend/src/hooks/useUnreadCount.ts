/**
 * @file useUnreadCount.ts
 * @description Hook để lấy số lượng thông báo chưa đọc và auto-refresh
 * Sử dụng custom event để sync giữa các components
 */

import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

// Custom event để broadcast refetch từ bất kỳ component nào
export const REFETCH_UNREAD_COUNT_EVENT = 'refetchUnreadCount';

export const useUnreadCount = () => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data?.unreadCount || 0);
        } catch (error) {
            console.error('[useUnreadCount] Error fetching unread count:', error);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch ngay khi mount
        fetchUnreadCount();

        // Auto-refresh mỗi 30 giây
        const intervalId = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        // Listen for custom event to refetch
        const handleRefetch = () => {
            fetchUnreadCount();
        };
        window.addEventListener(REFETCH_UNREAD_COUNT_EVENT, handleRefetch);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener(REFETCH_UNREAD_COUNT_EVENT, handleRefetch);
        };
    }, []);

    return {
        unreadCount,
        loading,
        refetch: fetchUnreadCount
    };
};

// Helper function để trigger refetch từ bất kỳ đâu
export const triggerRefetchUnreadCount = () => {
    window.dispatchEvent(new Event(REFETCH_UNREAD_COUNT_EVENT));
};
