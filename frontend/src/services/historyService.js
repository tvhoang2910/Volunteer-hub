/**
 * @file historyService.js
 * @description Service to fetch user activity history (events, interactions).
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const historyService = {
    getEvents: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/api/users/me/registrations`, {
            params: filters,
            headers: getAuthHeader()
        });
        return response.data;
    },

    getInteractions: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/api/users/me/interactions`, {
            params: filters,
            headers: getAuthHeader()
        });
        return response.data;
    }
};
