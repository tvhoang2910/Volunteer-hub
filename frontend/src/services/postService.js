/**
 * @file postService.js
 * @description Service for handling social posts in the application.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const postService = {
    getPosts: async (eventId, page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}/posts`, {
            params: { page, limit },
            headers: getAuthHeader()
        });
        return response.data;
    },

    getPost: async (postId) => {
        const response = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    createPost: async (eventId, formData) => {
        const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/posts`, formData, {
            headers: getAuthHeader()
        }); // Content-Type multipart/form-data is usually automatic with FormData, but axios handles it.
        return response.data;
    },

    updatePost: async (postId, formData) => {
        const response = await axios.put(`${API_BASE_URL}/api/posts/${postId}`, formData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    toggleReaction: async (postId) => {
        const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/reactions`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
