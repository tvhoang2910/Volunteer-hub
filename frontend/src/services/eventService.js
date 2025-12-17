/**
 * @file eventService.js
 * @description Service for handling event-related operations.
 * Includes methods for fetching events, registering, cancelling, and admin management.
 */

import axios from 'axios';
import { mockEvents } from '../data/mockEvents';
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

    registerEvent: async (eventId) => {
        const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/registrations`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

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
    },

    getMockEvents: () => {
        // Mock data for fallback
        return mockEvents;
    }
};
