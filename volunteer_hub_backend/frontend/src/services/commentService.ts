/**
 * @file commentService.ts
 * @description Service to handle comment-related API calls.
 * Includes fetching comments, replies, and posting new comments/replies.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch comments for a post
 * GET /api/posts/{postId}/comments
 */
export const fetchComments = async (postId: string, page = 0, size = 20) => {
    const response = await axios.get(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        params: { page, size },
        headers: getAuthHeaders()
    });
    // API trả về { data: Page<CommentResponse> }
    return response.data?.data || response.data;
};

/**
 * Fetch replies for a comment (nếu có endpoint riêng)
 * Hiện tại backend trả về replies kèm theo comment, nên có thể không cần
 */
export const fetchReplies = async (commentId: string) => {
    // Backend có thể trả về replies trong comment response
    // Nếu cần endpoint riêng thì implement sau
    return [];
};

/**
 * Create a new comment on a post
 * POST /api/posts/{postId}/comments
 */
export const postComment = async (postId: string, content: string, parentId?: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        content,
        parentId
    }, {
        headers: getAuthHeaders()
    });
    return response.data?.data || response.data;
};

/**
 * Update a comment
 * PUT /api/comments/{commentId}
 */
export const updateComment = async (commentId: string, content: string) => {
    const response = await axios.put(`${API_BASE_URL}/api/comments/${commentId}`, {
        content
    }, {
        headers: getAuthHeaders()
    });
    return response.data?.data || response.data;
};

/**
 * Delete a comment
 * DELETE /api/comments/{commentId}
 */
export const deleteComment = async (commentId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const postReply = async (postId: string, content: string, parentId: string) => {
    return postComment(postId, content, parentId);
};
