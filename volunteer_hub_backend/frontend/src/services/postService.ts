/**
 * @file postService.js
 * @description Service for handling social posts in the application.
 * Features CRUD operations, reactions, and API integration.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Axios instance for API calls
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const postService = {
    getPosts: async (page = 0, size = 10) => {
        try {
            const response = await api.get(`/posts?page=${page}&size=${size}`, {
                headers: getAuthHeader()
            });
            const data = response.data?.data;
            return {
                data: data?.content || [],
                hasMore: data?.number < data?.totalPages - 1
            };
        } catch (error) {
            console.error('[PostService] Error fetching posts:', error);
            throw error;
        }
    },

    getPostsByEvent: async (eventId, page = 0, size = 10) => {
        try {
            const response = await api.get(`/posts/event/${eventId}?page=${page}&size=${size}`, {
                headers: getAuthHeader()
            });
            const data = response.data?.data;
            return {
                data: data?.content || [],
                hasMore: data?.number < data?.totalPages - 1,
                totalElements: data?.totalElements || 0
            };
        } catch (error) {
            console.error('[PostService] Error fetching posts by event:', error);
            throw error;
        }
    },

    getPost: async (id) => {
        try {
            const response = await api.get(`/posts/${id}`, {
                headers: getAuthHeader()
            });
            return response.data?.data;
        } catch (error) {
            console.error('[PostService] Error fetching post:', error);
            throw error;
        }
    },

    createPost: async (postData) => {
        try {
            // postData should be { eventId, content, imageUrls? }
            const response = await api.post('/posts', postData, {
                headers: getAuthHeader()
            });
            return response.data?.data;
        } catch (error) {
            console.error('[PostService] Error creating post:', error);
            throw error;
        }
    },

    updatePost: async (id, postData) => {
        try {
            const response = await api.put(`/posts/${id}`, postData, {
                headers: getAuthHeader()
            });
            return response.data?.data;
        } catch (error) {
            console.error('[PostService] Error updating post:', error);
            throw error;
        }
    },

    deletePost: async (id) => {
        try {
            const response = await api.delete(`/posts/${id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('[PostService] Error deleting post:', error);
            throw error;
        }
    },

    toggleReaction: async (postId, reactionType = 'LIKE') => {
        try {
            const response = await api.post(`/posts/${postId}/reactions`, null, {
                params: { type: reactionType },
                headers: getAuthHeader()
            });
            return response.data?.data;
        } catch (error) {
            console.error('[PostService] Error toggling reaction:', error);
            throw error;
        }
    },

    /**
     * Upload an image to a post
     * @param postId - The ID of the post to upload the image to
     * @param file - The image file to upload
     * @returns The uploaded image data including imageUrl, imageId, postId
     */
    uploadPostImage: async (postId: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_BASE_URL}/api/upload/post-image/${postId}`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data?.data;
        } catch (error) {
            console.error('[PostService] Error uploading post image:', error);
            throw error;
        }
    },
};
