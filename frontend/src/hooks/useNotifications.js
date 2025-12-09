import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';

export const useNotifications = (initialPage = 1) => {
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async (page) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications(page);
            setNotifications(data.notifications || data.data || []);
            setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 10));
        } catch (err) {
            setError(err.message);
            // Fallback data logic
            const demoNotifications = [
                {
                    id: 1,
                    title: "Thông báo mẫu",
                    date: "2024-01-01",
                    message: "Đây là một thông báo mẫu",
                    status: "Chưa đọc",
                    description: "Chi tiết đầy đủ của thông báo mẫu này sẽ được hiển thị ở đây. Đây là dữ liệu demo khi API không hoạt động.",
                    location: "Hà Nội",
                    start_time: "2024-01-01T08:00:00Z",
                    end_time: "2024-01-01T17:00:00Z",
                    max_volunteers: 50,
                    current_volunteers: 32
                },
                {
                    id: 2,
                    title: "Thông báo thứ hai",
                    date: "2024-01-02",
                    message: "Đây là thông báo mẫu thứ hai",
                    status: "Đã đọc",
                    description: "Chi tiết của thông báo thứ hai. Dữ liệu này được hiển thị khi API gặp lỗi.",
                    location: "TP.HCM",
                    start_time: "2024-01-02T09:00:00Z",
                    end_time: "2024-01-02T18:00:00Z",
                    max_volunteers: 30,
                    current_volunteers: 15
                },
                {
                    id: 3,
                    title: "Thông báo thứ ba",
                    date: "2024-01-03",
                    message: "Đây là thông báo mẫu thứ ba",
                    status: "Chưa đọc",
                    description: "Chi tiết của thông báo thứ ba. Dữ liệu này được hiển thị khi API gặp lỗi.",
                    location: "Đà Nẵng",
                    start_time: "2024-01-03T10:00:00Z",
                    end_time: "2024-01-03T19:00:00Z",
                    max_volunteers: 25,
                    current_volunteers: 8
                },
                {
                    id: 4,
                    title: "Thông báo thứ tư",
                    date: "2024-01-04",
                    message: "Đây là thông báo mẫu thứ tư",
                    status: "Đã đọc",
                    description: "Chi tiết của thông báo thứ tư. Dữ liệu này được hiển thị khi API gặp lỗi.",
                    location: "Cần Thơ",
                    start_time: "2024-01-04T11:00:00Z",
                    end_time: "2024-01-04T20:00:00Z",
                    max_volunteers: 40,
                    current_volunteers: 22
                },
                {
                    id: 5,
                    title: "Thông báo thứ năm",
                    date: "2024-01-05",
                    message: "Đây là thông báo mẫu thứ năm",
                    status: "Chưa đọc",
                    description: "Chi tiết của thông báo thứ năm. Dữ liệu này được hiển thị khi API gặp lỗi.",
                    location: "Hải Phòng",
                    start_time: "2024-01-05T12:00:00Z",
                    end_time: "2024-01-05T21:00:00Z",
                    max_volunteers: 35,
                    current_volunteers: 18
                }
            ];

            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            const paginatedData = demoNotifications.slice(startIndex, endIndex);

            setNotifications(paginatedData);
            setTotalPages(Math.ceil(demoNotifications.length / 10));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id
                        ? { ...notif, status: "Đã đọc" }
                        : notif
                )
            );
        } catch (error) {
            // Even if API fails, we might want to update UI optimistically or handle error
            // For now, just log it as per original code
            console.error("Lỗi cập nhật trạng thái:", error);
        }
    };

    const changePage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        notifications,
        currentPage,
        totalPages,
        isLoading,
        error,
        markAsRead,
        changePage,
        refresh: () => fetchNotifications(currentPage)
    };
};
