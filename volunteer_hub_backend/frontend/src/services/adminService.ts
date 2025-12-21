/**
 * @file adminService.ts
 * @description Service for admin management tasks (users, events, exports, broadcasts, cache).
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const adminService = {
    /**
     * Get all users
     * @param {number} page
     * @param {number} limit
     * @param {string} role
     */
    getAllUsers: async (page = 1, limit = 10, role?: string) => {
        const params: any = { page, limit };
        if (role) params.role = role;
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            params,
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Lock user account
     * PUT /api/admin/users/{userId}/lock
     * @param {string} userId
     */
    lockUser: async (userId: string) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/lock`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Unlock user account
     * PUT /api/admin/users/{userId}/unlock
     * @param {string} userId
     */
    unlockUser: async (userId: string) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/unlock`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Update user status (ban/unban) - Legacy method using lock/unlock
     * @param {string} userId
     * @param {boolean} isActive
     * @param {string} reason (unused - kept for backward compatibility)
     */
    updateUserStatus: async (userId: string, isActive: boolean, reason?: string) => {
        // isActive = false means lock, isActive = true means unlock
        if (isActive) {
            const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/unlock`, {}, {
                headers: getAuthHeader()
            });
            return response.data;
        } else {
            const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/lock`, {}, {
                headers: getAuthHeader()
            });
            return response.data;
        }
    },

    /**
     * Approve event
     * PUT /api/admin/events/{eventId}/approve
     * @param {string} eventId
     */
    approveEvent: async (eventId: string) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/events/${eventId}/approve`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Reject event
     * PUT /api/admin/events/{eventId}/reject
     * @param {string} eventId
     */
    rejectEvent: async (eventId: string) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/events/${eventId}/reject`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Delete event
     * DELETE /api/admin/events/{eventId}
     * @param {string} eventId
     */
    deleteEvent: async (eventId: string) => {
        const response = await axios.delete(`${API_BASE_URL}/api/admin/events/${eventId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Export events
     * GET /api/admin/events/export
     * @param {string} format - 'json' or 'csv'
     */
    exportEvents: async (format: string = 'json') => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/events/export`, {
            params: { format },
            headers: getAuthHeader(),
            responseType: format === 'csv' ? 'blob' : 'json'
        });
        return response.data;
    },

    /**
     * Export volunteers
     * GET /api/admin/volunteers/export
     * @param {string} format - 'json' or 'csv'
     */
    exportVolunteers: async (format: string = 'json') => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/volunteers/export`, {
            params: { format },
            headers: getAuthHeader(),
            responseType: format === 'csv' ? 'blob' : 'json'
        });
        return response.data;
    },

    /**
     * Get admin dashboard stats
     * GET /api/admin/dashboard
     */
    getDashboard: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Broadcast notification to users
     * POST /api/notifications/broadcast
     * @param {Object} payload - { title, content, targetUserIds?, sendToAll? }
     */
    broadcastNotification: async (payload: {
        title: string;
        content: string;
        targetUserIds?: string[];
        sendToAll?: boolean;
    }) => {
        const response = await axios.post(`${API_BASE_URL}/api/notifications/broadcast`, payload, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Refresh top posts cache
     * PUT /api/admin/cache/top-posts/refresh
     */
    refreshTopPostsCache: async () => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/cache/top-posts/refresh`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Invalidate top posts cache
     * PUT /api/admin/cache/top-posts/invalidate
     */
    invalidateTopPostsCache: async () => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/cache/top-posts/invalidate`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Rebuild post ranking from database
     * PUT /api/admin/cache/top-posts/rebuild-ranking
     */
    rebuildPostRanking: async () => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/cache/top-posts/rebuild-ranking`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Get cached top posts
     * GET /api/admin/cache/top-posts
     * @param {number} limit - Number of posts to retrieve (default 5)
     */
    getCachedTopPosts: async (limit: number = 5) => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/cache/top-posts`, {
            params: { limit },
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Get all events (admin view)
     * GET /api/admin/events
     */
    getAllEvents: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/events`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Create a new admin user
     * POST /api/admin/users
     * @param {Object} payload - User data
     */
    createAdmin: async (payload: any) => {
        const response = await axios.post(
            `${API_BASE_URL}/api/admin/users`,
            payload,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Admin role requests
     * GET /api/admin/admin-requests?status=PENDING
     */
    getAdminRoleRequests: async (status: string = 'PENDING') => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/admin-requests`, {
            params: { status },
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Approve admin role request
     * PUT /api/admin/admin-requests/{requestId}/approve
     */
    approveAdminRoleRequest: async (requestId: string, note?: string) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/admin-requests/${requestId}/approve`, {}, {
            params: note ? { note } : undefined,
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Reject admin role request
     * PUT /api/admin/admin-requests/{requestId}/reject
     */
    rejectAdminRoleRequest: async (requestId: string, note?: string) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/admin-requests/${requestId}/reject`, {}, {
            params: note ? { note } : undefined,
            headers: getAuthHeader()
        });
        return response.data;
    }
};
