/**
 * @file postService.js
 * @description Service for handling social posts in the application.
 * Features CRUD operations, reactions, and mock data simulation.
 */

import axios from 'axios';
import { MOCK_POSTS } from '@/data/postData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Axios instance (configured for real API usage later)
const api = axios.create({
    baseURL: 'https://api.example.com', // Replace with real API
    headers: {
        'Content-Type': 'application/json',
    },
});

export const postService = {
    getPosts: async (page = 1, limit = 10) => {
        // REAL CALL: return api.get(`/posts?page=${page}&limit=${limit}`);

        // MOCK CALL:
        await delay(800);
        // Simulate infinite scroll by returning same data but with different IDs if page > 1
        const newPosts = MOCK_POSTS.map(p => ({
            ...p,
            id: p.id + (page - 1) * 10
        }));
        return {
            data: newPosts,
            hasMore: page < 5 // Limit to 5 pages for demo
        };
    },

    getPost: async (id) => {
        // REAL CALL: return api.get(`/posts/${id}`);
        await delay(500);
        return MOCK_POSTS.find(p => p.id === id) || MOCK_POSTS[0];
    },

    createPost: async (formData) => {
        // REAL CALL: return api.post('/posts', formData);
        await delay(1000);
        const newPost = {
            id: Date.now(),
            user: {
                id: 999,
                name: 'Current User',
                avatar: 'https://i.pravatar.cc/150?u=999',
            },
            content: formData.get('content'),
            media: [], // Handle media upload mock
            likes: 0,
            comments: 0,
            isLiked: false,
            createdAt: new Date().toISOString(),
        };

        // Mock media handling
        const files = formData.getAll('media');
        if (files && files.length > 0) {
            // In a real app, these would be URLs from S3/Cloudinary
            newPost.media = files.map((file, index) => ({
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: URL.createObjectURL(file)
            }));
        }

        return newPost;
    },

    updatePost: async (id, formData) => {
        // REAL CALL: return api.put(`/posts/${id}`, formData);
        await delay(800);
        return {
            id,
            content: formData.get('content'),
            // ... other updated fields
        };
    },

    deletePost: async (id) => {
        // REAL CALL: return api.delete(`/posts/${id}`);
        await delay(500);
        return { success: true };
    },

    toggleReaction: async (id) => {
        // REAL CALL: return api.post(`/posts/${id}/reactions`);
        await delay(300);
        return { success: true };
    }
};
