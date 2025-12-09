
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const eventService = {
    getAllEvents: async (page = 1, limit = 9) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error("Lỗi khi tải danh sách sự kiện");
            return await response.json();
        } catch (error) {
            console.error("Error fetching events:", error);
            throw error;
        }
    },

    registerEvent: async (eventId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Lỗi khi đăng ký sự kiện");
            return await response.json();
        } catch (error) {
            console.error("Error registering event:", error);
            throw error;
        }
    },

    cancelRegistration: async (eventId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Lỗi khi hủy đăng ký");
            return await response.json();
        } catch (error) {
            console.error("Error canceling registration:", error);
            throw error;
        }
    },

    getEventDetails: async (eventId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
            if (!response.ok) throw new Error("Failed to fetch event details");
            return await response.json();
        } catch (error) {
            console.error("Error fetching event details:", error);
            throw error;
        }
    },

    getAllEventsAdmin: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/event/all`, {
                method: "GET",
                headers: {
                    "admin": "true",
                    "authorization": "Bearer " + token
                },
            });
            if (!response.ok) throw new Error("Send request failed");
            return await response.json();
        } catch (error) {
            console.error("Error fetching admin events:", error);
            throw error;
        }
    },

    deleteEvent: async (eventId, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/event/?id=${eventId}`, {
                method: "DELETE",
                headers: {
                    "admin": "true",
                    "authorization": "Bearer " + token
                },
            });
            if (!response.ok) throw new Error("Send request failed");
            return await response.json();
        } catch (error) {
            console.error("Error deleting event:", error);
            throw error;
        }
    },

    getMockEvents: () => {
        return [
            { event_id: '1', title: 'Workshop React Advanced', start_time: '2025-10-21', category: 'Workshop', location: 'Hà Nội', description: 'Học React nâng cao, Performance optimization, Server Components.', registered: false, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60' },
            { event_id: '2', title: 'Webinar AI Revolution', start_time: '2025-10-22', category: 'Webinar', location: 'Online', description: 'Cập nhật xu hướng AI mới nhất năm 2025.', registered: true, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60' },
            { event_id: '3', title: 'Tech Talk Cloud Native', start_time: '2025-10-23', category: 'Tech Talk', location: 'TP.HCM', description: 'Kiến trúc Cloud Native và Kubernetes.', registered: false, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60' },
            { event_id: '4', title: 'Meetup Dev Community', start_time: '2025-10-29', category: 'Meetup', location: 'Đà Nẵng', description: 'Giao lưu cộng đồng lập trình viên miền Trung.', registered: false, image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=60' },
            { event_id: '5', title: 'Workshop Next.js 15', start_time: '2025-11-01', category: 'Workshop', location: 'Hà Nội', description: 'Những tính năng mới trong Next.js 15.', registered: true, image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=60' },
            { event_id: '6', title: 'Webinar DevOps Culture', start_time: '2025-10-25', category: 'Webinar', location: 'Online', description: 'Xây dựng văn hóa DevOps trong doanh nghiệp.', registered: false, image: 'https://images.unsplash.com/photo-1667372393119-c81c0cda0a29?w=800&auto=format&fit=crop&q=60' },
            { event_id: '7', title: 'Tech Talk GraphQL', start_time: '2025-10-21', category: 'Tech Talk', location: 'TP.HCM', description: 'Tối ưu hóa API với GraphQL.', registered: false, image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&auto=format&fit=crop&q=60' },
            { event_id: '8', title: 'Meetup Tester & QA', start_time: '2025-10-24', category: 'Meetup', location: 'Hà Nội', description: 'Chia sẻ kinh nghiệm kiểm thử phần mềm.', registered: false, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60' },
            { event_id: '9', title: 'Workshop UI/UX Design', start_time: '2025-10-28', category: 'Workshop', location: 'Đà Nẵng', description: 'Thiết kế trải nghiệm người dùng hiện đại.', registered: true, image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&auto=format&fit=crop&q=60' },
            { event_id: '10', title: 'Tech Talk Mobile App', start_time: '2025-10-30', category: 'Tech Talk', location: 'TP.HCM', description: 'Phát triển ứng dụng đa nền tảng với Flutter.', registered: false, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60' },
        ];
    }
};
