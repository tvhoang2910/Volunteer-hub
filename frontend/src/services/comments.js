/**
 * @file comments.js
 * @description Service for handling CRUD operations on comments directly via API.
 * This service expects authentication tokens and connects to the backend API.
 */

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createComment = async ({ postId, message, parentId }) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_BASE_URL}/api/comments`, {
            postId,
            message,
            parentId
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error creating comment";
    }
};

export const updateComment = async ({ postId, message, id }) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${API_BASE_URL}/api/comments/${id}`, {
            message
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error updating comment";
    }
};

export const deleteComment = async ({ postId, id }) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_BASE_URL}/api/comments/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error deleting comment";
    }
};

export const toggleCommentLike = async ({ id, postId }) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_BASE_URL}/api/comments/${id}/like`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error toggling like";
    }
};