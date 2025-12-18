/**
 * @file authService.js
 * @description Authentication service for handling registration, login, logout, and token management.
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const authService = {
    /**
     * Register a new user
     * @param {Object} userData - { name, email, password, role }
     */
    register: async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
        return response.data;
    },

    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    /**
     * Refresh access token
     * @param {string} refreshToken 
     */
    refreshToken: async (refreshToken) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refresh_token: refreshToken });
        return response.data;
    },

    /**
     * Verify email address
     * @param {string} token 
     */
    verifyEmail: async (token) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token });
        return response.data;
    },

    /**
     * Request password reset
     * @param {string} email 
     */
    forgotPassword: async (email) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
        return response.data;
    },

    /**
     * Reset password with token
     * @param {Object} data - { token, new_password }
     */
    resetPassword: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, data);
        return response.data;
    }
};
