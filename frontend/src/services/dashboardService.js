/**
 * @file dashboardService.js
 * @description Service for fetching dashboard data for different roles.
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const dashboardService = {
    /**
     * Get volunteer dashboard data
     */
    getVolunteerDashboard: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard/volunteer`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Get manager dashboard data
     */
    getManagerDashboard: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard/manager`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Get admin dashboard data
     */
    getAdminDashboard: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard/admin`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Get trending events
     * @param {number} limit 
     */
    getTrendingEvents: async (limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard/trending`, {
            params: { limit },
            headers: getAuthHeader()
        });
        return response.data;
    }
};
