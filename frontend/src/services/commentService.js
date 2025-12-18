/**
 * @file commentService.js
 * @description Service to handle comment-related API calls.
 * Includes fetching comments, replies, posting new comments/replies, updates, deletes, and likes.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const commentService = {
    fetchComments: async (postId) => {
        const response = await axios.get(`${API_BASE_URL}/api/posts/${postId}/comments`);
        return response.data;
    },

    fetchReplies: async (commentId) => {
        const response = await axios.get(`${API_BASE_URL}/api/comments/${commentId}/replies`);
        return response.data;
    },

    postComment: async (postId, content, parentId = null) => {
        const payload = { content, parent_id: parentId };
        const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/comments`, payload, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    postReply: async (commentId, content) => {
        const payload = { content };
        const response = await axios.post(`${API_BASE_URL}/api/comments/${commentId}/replies`, payload, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateComment: async (commentId, message) => {
        const response = await axios.put(`${API_BASE_URL}/api/comments/${commentId}`, { message }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    deleteComment: async (commentId, postId) => {
        // postId might be needed for cache invalidation or backend verification if required by API spec
        const response = await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
            headers: getAuthHeader(),
            data: { postId } // Should check if backend expects body in DELETE
        });
        return response.data;
    },

    toggleCommentLike: async (commentId, postId) => {
        const response = await axios.post(`${API_BASE_URL}/api/comments/${commentId}/like`, { postId }, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

// Export individual functions for backward compatibility with imports that pick specific names
export const {
    fetchComments,
    fetchReplies,
    postComment,
    postReply,
    updateComment,
    deleteComment,
    toggleCommentLike
} = commentService;
