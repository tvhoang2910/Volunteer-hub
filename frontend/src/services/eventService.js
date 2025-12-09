
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
            // Check if we have a real API
            // const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
            // if (!response.ok) throw new Error("Failed to fetch event details");
            // return await response.json();

            // FALLBACK TO MOCK FOR DEMO
            const events = eventService.getMockEvents();
            const event = events.find(e => e.event_id === eventId || e.id === eventId) || events[0];

            // Enrich with details if missing (mock)
            return {
                ...event,
                timeline: event.timeline || { start: event.start_time || "2025-10-21", end: "2025-10-21" },
                organizer: event.organizer || { name: "VolunteerHub Admin", organization: "VolunteerHub" },
                contact: event.contact || { phone: "0909000111", email: "contact@volunteerhub.org" },
                mission: event.mission || "Sứ mệnh của sự kiện là mang lại giá trị cho cộng đồng.",
                requirements: event.requirements ? (Array.isArray(event.requirements) ? event.requirements : [event.requirements]) : ["Nhiệt tình", "Đúng giờ"],
                volunteersNeeded: event.capacity || 50,
                volunteers: event.volunteers || [
                    { id: "vol-1", name: "Nguyen Minh Anh", role: "Truong nhom", hours: 24, status: "completed", joinedAt: "12/02/2026", phone: "0901 222 333" },
                    { id: "vol-2", name: "Tran Binh An", role: "Thanh vien", hours: 20, status: "completed", joinedAt: "15/02/2026", phone: "0988 667 221" }
                ],
                pendingVolunteers: event.pendingVolunteers || [
                    { id: "pending-1", name: "Pham Quoc Huy", submittedAt: "05/03/2026", motivation: "Muon dong gop suc luc." }
                ],
                report: event.report || {
                    progress: 80,
                    hours: 100,
                    satisfaction: 4.8,
                    incidents: 0,
                    highlights: ["Thành công tốt đẹp", "Vượt chỉ tiêu"],
                    files: [{ name: "Report.pdf", updated: "2025-10-22" }]
                }
            };

        } catch (error) {
            console.error("Error fetching event details:", error);
            throw error;
        }
    },

    getAllEventsAdmin: async (token) => {
        // Mock return existing mock events
        return {
            managed: eventService.getMockEvents().slice(0, 5),
            pending: eventService.getMockEvents().slice(5, 10)
        };
    },

    deleteEvent: async (eventId, token) => {
        // Mock success
        return { success: true };
    },

    // New methods for Event Management
    createEvent: async (eventData, token) => {
        // Mock success
        console.log("Created event:", eventData);
        return { success: true, data: eventData };
    },

    updateEvent: async (eventId, eventData, token) => {
        // Mock success
        console.log("Updated event:", eventId, eventData);
        return { success: true, data: eventData };
    },

    getEventRegistrations: async (eventId, token) => {
        return [
            { id: 1, name: "Nguyen Van A", email: "a@gmail.com", status: "pending" },
            { id: 2, name: "Tran Thi B", email: "b@gmail.com", status: "approved" },
            { id: 3, name: "Le Van C", email: "c@gmail.com", status: "rejected" }
        ];
    },

    approveRegistration: async (eventId, userId, token) => {
        return { success: true, status: "approved" };
    },

    rejectRegistration: async (eventId, userId, token) => {
        return { success: true, status: "rejected" };
    },

    updateVolunteerStatus: async (eventId, userId, status, token) => {
        return { success: true };
    },

    getEventStats: async (eventId) => {
        return {
            totalParticipants: 50,
            completionRate: 85,
            completed: 40,
            absent: 5,
            incomplete: 5
        };
    },

    getMockEvents: () => {
        return [
            {
                event_id: '0', title: 'Trồng cây xanh vì cộng đồng', location: 'Hà Nội, Việt Nam', start_time: '2026-03-20', end_time: '2026-03-25', description: 'Chiến dịch mùa xuân 2026', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80', capacity: 60, requirements: ["Sức khỏe tốt"], status: "managed",
                report: {
                    progress: 78, hours: 184, satisfaction: 4.7, incidents: 0,
                    highlights: ["Da huy dong du 48/60 tinh nguyen vien", "Tai tro them 100 cay"],
                    files: [{ name: "Bao_cao_so_bo.pdf", updated: "02/03/2026" }]
                }
            },
            { event_id: '1', title: 'Workshop React Advanced', start_time: '2025-10-21', category: 'Workshop', location: 'Hà Nội', description: 'Học React nâng cao, Performance optimization, Server Components.', registered: false, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60', capacity: 100, requirements: ["Laptop"], status: "managed" },
            { event_id: '2', title: 'Webinar AI Revolution', start_time: '2025-10-22', category: 'Webinar', location: 'Online', description: 'Cập nhật xu hướng AI mới nhất năm 2025.', registered: true, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60', capacity: 500, requirements: ["None"], status: "pending" },
            { event_id: '3', title: 'Tech Talk Cloud Native', start_time: '2025-10-23', category: 'Tech Talk', location: 'TP.HCM', description: 'Kiến trúc Cloud Native và Kubernetes.', registered: false, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60', capacity: 200, requirements: ["Basic Cloud Knowledge"], status: "managed" },
            { event_id: '4', title: 'Meetup Dev Community', start_time: '2025-10-29', category: 'Meetup', location: 'Đà Nẵng', description: 'Giao lưu cộng đồng lập trình viên miền Trung.', registered: false, image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=60', capacity: 50, requirements: ["Open mind"], status: "pending" },
            { event_id: '5', title: 'Workshop Next.js 15', start_time: '2025-11-01', category: 'Workshop', location: 'Hà Nội', description: 'Những tính năng mới trong Next.js 15.', registered: true, image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=60', capacity: 30, requirements: ["Laptop with Node.js"], status: "managed" },
        ];
    }
};
