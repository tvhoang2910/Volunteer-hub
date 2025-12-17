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
        // Mock Accounts
        const mockUsers = {
            'admin@test.com': { role: 'admin', token: 'mock-token-admin' },
            'manager@test.com': { role: 'manager', token: 'mock-token-manager' },
            'user@test.com': { role: 'volunteer', token: 'mock-token-volunteer' }
        };

        if (mockUsers[credentials.email] && credentials.password === '123456') {
            const user = mockUsers[credentials.email];
            // If role is provided in credentials, verify it matches or just override?
            // Since the UI passes role, we should probably check it or just trust the specific email.
            // For simplify, we enforce the role based on email.

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                token: user.token,
                role: user.role,
                user: { email: credentials.email, name: 'Mock ' + user.role }
            };
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        const token = localStorage.getItem('token');
        if (token && token.startsWith('mock-token-')) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            return { message: 'Logged out successfully' };
        }

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
    },
    /**
     * Verify user role
     * @returns {Object} - { role }
     */
    verifyRole: async () => {
        const token = localStorage.getItem('token');

        if (token && token.startsWith('mock-token-')) {
            const role = token.replace('mock-token-', '');
            const responseData = { role: role };
            localStorage.setItem('role', responseData.role);
            return responseData;
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/verify-role`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.setItem('role', response.data.role);
        return response.data;
    }
};
