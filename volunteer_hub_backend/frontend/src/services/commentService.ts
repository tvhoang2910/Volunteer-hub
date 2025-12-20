/**
 * @file commentService.js
 * @description Service to handle comment-related API calls and mock data interactions.
 * Includes fetching comments, replies, and posting new comments/replies.
 */

import axios from 'axios';
import { MOCK_ROOT_COMMENTS, MOCK_REPLIES } from '@/data/commentData';

const API_URL = 'https://api.example.com'; // Replace with actual API URL if available
const USE_MOCK = true; // Toggle this to use real API

export const fetchComments = async (postId) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_ROOT_COMMENTS);
            }, 500);
        });
    }
    const response = await axios.get(`${API_URL}/comments`, {
        params: {
            commentable_type: 'BlogPost',
            commentable_id: postId
        }
    });
    return response.data;
};

export const fetchReplies = async (commentId) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_REPLIES);
            }, 500);
        });
    }
    const response = await axios.get(`${API_URL}/comments`, {
        params: {
            commentable_type: 'Comment',
            commentable_id: commentId
        }
    });
    return response.data;
};

export const postComment = async (data) => {
    // data: { commentable_type, commentable_id, comment }
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        id: Date.now(),
                        user_id: 999999,
                        commentable_type: data.commentable_type,
                        commentable_id: data.commentable_id,
                        comment: data.comment,
                        is_approved: true,
                        is_answered: false,
                        is_removed: false,
                        reactions_count: 0,
                        replies_count: 0,
                        replies: [],
                        current_page: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        commentator: {
                            data: {
                                id: 999999,
                                username: "current_user",
                                full_name: "Current User",
                                avatar_url: "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f9a2fd4e064.jpg",
                                is_pro: true,
                                is_verified: true,
                                is_blocked: false
                            }
                        },
                        reactions: { data: [] }
                    }
                });
            }, 500);
        });
    }
    const response = await axios.post(`${API_URL}/comments`, data);
    return response.data;
};

export const postReply = async (data) => {
    return postComment(data); // Same endpoint structure usually
};
