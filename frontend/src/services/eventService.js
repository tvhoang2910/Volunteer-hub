/**
 * @file eventService.js
 * @description Service for handling event-related operations.
 * Includes methods for fetching events, registering, cancelling, and admin management.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const eventService = {
    getAllEvents: async (page = 1, limit = 9, status) => {
        const params = { page, limit, status };
        const response = await axios.get(`${API_BASE_URL}/api/events`, { params });
        return response.data;
    },

      const payload = await response.json();
      const events = (payload?.data || payload?.events || []).map(
        normalizeEvent
      );

    cancelRegistration: async (registrationId, eventId) => {
        // Note: Modified endpoint to DELETE /api/registrations/:registration_id as per request
        // Passed eventId in body if needed (though REST DELETE usually just needs ID)
        const response = await axios.delete(`${API_BASE_URL}/api/registrations/${registrationId}`, {
            headers: getAuthHeader(),
            data: { eventId }
        });
        return response.data;
    },

    getEventDetails: async (eventId) => {
        const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}`);
        return response.data;
    },

    getAllEventsAdmin: async (token) => {
        // token can be ignored if we rely on localStorage in getAuthHeader(), 
        // but keeping signature or using provided token if passed.
        const headers = token ? { Authorization: `Bearer ${token}` } : getAuthHeader();
        const response = await axios.get(`${API_BASE_URL}/api/admin/events`, { headers });
        return response.data;
    },

    deleteEvent: async (eventId) => {
        const response = await axios.delete(`${API_BASE_URL}/api/events/${eventId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    createEvent: async (eventData) => {
        const response = await axios.post(`${API_BASE_URL}/api/events`, eventData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateEvent: async (eventId, eventData) => {
        const response = await axios.put(`${API_BASE_URL}/api/events/${eventId}`, eventData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getEventRegistrations: async (eventId) => {
        const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}/registrations`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    approveRegistration: async (registrationId, eventId, userId) => {
        const response = await axios.put(`${API_BASE_URL}/api/registrations/${registrationId}/status`, {
            eventId, userId, status: 'approved'
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    rejectRegistration: async (registrationId, eventId, userId) => {
        const response = await axios.put(`${API_BASE_URL}/api/registrations/${registrationId}/status`, {
            eventId, userId, status: 'rejected'
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateVolunteerStatus: async (registrationId, eventId, userId, status) => {
        const response = await axios.put(`${API_BASE_URL}/api/registrations/${registrationId}/completion`, {
            eventId, userId, status
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getEventStats: async (eventId) => {
        const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    }
  },

  getPendingEvents: async (page = 1, limit = 9) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events?status=PENDING`);
      if (!response.ok)
        throw new Error("Lỗi khi tải danh sách sự kiện đang chờ duyệt");

      const payload = await response.json();
      const events = (payload?.data || payload?.events || []).map(
        normalizeEvent
      );

      return {
        events,
        total: events.length,
        totalPages: Math.max(1, Math.ceil(events.length / limit)),
      };
    } catch (error) {
      console.error("Error fetching pending events:", error);
      return {
        events: [],
        total: 0,
        totalPages: 0,
      };
    }
  },

  registerEvent: async (eventId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/events/${eventId}/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Lỗi khi đăng ký sự kiện");
    return response.json();
  },

  cancelRegistration: async (eventId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/events/${eventId}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Lỗi khi hủy đăng ký");
    return response.json();
  },

  getEventDetails: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event details");
      const payload = await response.json();
      return normalizeEvent(payload?.data || payload);
    } catch (error) {
      console.error("Fetch detail failed, fallback to mock:", error);
      const mock =
        managerEvents.find((e) => e.id === eventId || e.event_id === eventId) ||
        managerEvents[0];
      return normalizeEvent(mock);
    }
  },

  /* ================= ADMIN / MANAGER (MOCK TẠM) ================= */

  getAllEventsAdmin: async () => ({
    managed: managerEvents.slice(0, 5),
    pending: [],
  }),

  deleteEvent: async () => ({ success: true }),

  createEvent: async (eventData) => ({
    success: true,
    data: eventData,
  }),

  updateEvent: async (eventId, eventData) => ({
    success: true,
    data: eventData,
  }),

  getEventRegistrations: async (eventId) => {
    const event =
      managerEvents.find((e) => e.id === eventId) || managerEvents[0];
    return event.volunteers || [];
  },

  approveRegistration: async () => ({ success: true, status: "approved" }),
  rejectRegistration: async () => ({ success: true, status: "rejected" }),

  getEventStats: async () => ({
    totalParticipants: 50,
    completionRate: 85,
    completed: 40,
    absent: 5,
    incomplete: 5,
  }),
};
