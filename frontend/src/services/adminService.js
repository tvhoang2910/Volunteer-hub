/**
 * @file adminService.js
 * @description Service for admin management tasks (users, events, exports, broadcasts).
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const adminService = {
    /**
     * Get all users
     * @param {number} page 
     * @param {number} limit 
     * @param {string} role 
     */
    getAllUsers: async (page = 1, limit = 10, role) => {
        const params = { page, limit, role };
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            params,
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Update user status (ban/unban)
     * @param {string} userId 
     * @param {boolean} isActive 
     * @param {string} reason 
     */
    updateUserStatus: async (userId, isActive, reason) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/status`, { is_active: isActive, reason }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Approve or reject an event
     * @param {string} eventId 
     * @param {string} status 
     * @param {string} reason 
     */
    approveEvent: async (eventId, status, reason) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/events/${eventId}/approval`, { status, reason }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Export data
     * @param {string} type 
     * @param {string} format 
     * @param {Object} filters 
     */
    exportData: async (type, format, filters) => {
        const params = { format, ...filters };
        const response = await axios.get(`${API_BASE_URL}/api/admin/export/${type}`, {
            params,
            headers: getAuthHeader(),
            responseType: 'blob' // Assuming file download
        });
        return response.data;
    },

    /**
     * Broadcast notification
     * @param {Object} payload - { title, body, target }
     */
    broadcastNotification: async (payload) => {
        const response = await axios.post(`${API_BASE_URL}/api/admin/notifications/broadcast`, payload, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
