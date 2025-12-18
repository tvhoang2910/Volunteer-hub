/**
 * @file statisticService.js
 * @description Service for fetching application statistics.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const statisticService = {
    getStatistics: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/statistics/public`);
        return response.data;
    },

    getAdminDashboardStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard/admin`, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
