/**
 * @file notificationService.js
 * @description Service for handling notifications.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const notificationService = {
    getNotifications: async (page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
            params: { page, limit },
            headers: getAuthHeader()
        });
        return response.data;
    },

    markAsRead: async (notificationId) => {
        // Updated endpoint to /read as per requirement
        const response = await axios.post(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
