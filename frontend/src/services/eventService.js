/**
 * @file eventService.js
 * @description Service for handling event-related operations.
 * Includes methods for fetching events, registering, cancelling, and admin management.
 * Supports both real API and mock data fallbacks.
 */

import { managerEvents } from "@/data/managerEvents";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const eventService = {
    getAllEvents: async (page = 1, limit = 9) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error("Lỗi khi tải danh sách sự kiện");
            return await response.json();
        } catch (error) {
            console.error("Error fetching events:", error);
            // Fallback to mock data if API fails or for demo
            return {
                data: managerEvents, // rudimentary array return
                meta: { page, limit, total: managerEvents.length }
            };
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

            // FALLBACK TO MOCK FROM DATA FOLDER
            const event = managerEvents.find(e => e.id === eventId || e.event_id === eventId);

            if (!event) {
                // Fallback to first one if not found (for dev convenience) or return managerEvents[0]
                return managerEvents[0];
            }
            return event;

        } catch (error) {
            console.error("Error fetching event details:", error);
            throw error;
        }
    },

    getAllEventsAdmin: async (token) => {
        return {
            managed: managerEvents.slice(0, 5),
            pending: []
        };
    },

    deleteEvent: async (eventId, token) => {
        return { success: true };
    },

    createEvent: async (eventData, token) => {
        console.log("Created event:", eventData);
        return { success: true, data: eventData };
    },

    updateEvent: async (eventId, eventData, token) => {
        console.log("Updated event:", eventId, eventData);
        return { success: true, data: eventData };
    },

    getEventRegistrations: async (eventId, token) => {
        const event = managerEvents.find(e => e.id === eventId) || managerEvents[0];
        return event.volunteers || [];
    },

    approveRegistration: async (eventId, userId, token) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, status: "approved" };
    },

    rejectRegistration: async (eventId, userId, token) => {
        await new Promise(resolve => setTimeout(resolve, 500));
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
    }
};
