const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const notificationService = {
    async getNotifications(page = 1, limit = 10) {
        try {
            const response = await fetch(`${API_URL}/api/notifications?page=${page}&limit=${limit}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Lỗi khi tải danh sách thông báo");
            }

            return await response.json();
        } catch (error) {
            console.error("Notification Service Error:", error);
            throw error;
        }
    },

    async markAsRead(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/notifications/${id}/mark-read`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Lỗi khi cập nhật trạng thái");
            }

            return true;
        } catch (error) {
            console.error("Mark as read error:", error);
            throw error;
        }
    }
};
