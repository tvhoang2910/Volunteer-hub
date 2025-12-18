/**
 * @file eventService.js
 * @description Service for handling event-related operations.
 */

import { managerEvents } from "@/data/managerEvents";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const normalizeEvent = (event = {}) => ({
  event_id: event.event_id || event.eventId || event.id,
  title: event.title || "Sự kiện",
  description: event.description || "",
  location: event.location || "Đang cập nhật",
  start_time: event.start_time || event.startTime || event.createdAt || "",
  end_time:
    event.end_time ||
    event.endTime ||
    event.start_time ||
    event.startTime ||
    "",
  registration_deadline:
    event.registration_deadline ||
    event.registrationDeadline ||
    event.end_time ||
    event.endTime ||
    event.start_time ||
    event.startTime ||
    "",
  max_volunteers: event.max_volunteers ?? event.maxVolunteers ?? 0,
  category: event.category || "Khác",
  image: event.image || "",
  registered: !!event.registered,
});

export const eventService = {
  getAllEvents: async (page = 1, limit = 9) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error("Lỗi khi tải danh sách sự kiện");

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
      console.error("Error fetching events, fallback to mock:", error);
      return {
        events: managerEvents.map(normalizeEvent),
        total: managerEvents.length,
        totalPages: Math.ceil(managerEvents.length / limit),
      };
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
