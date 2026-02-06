/**
 * @file statisticService.ts
 * @description Service for fetching application statistics (dashboard data).
 * Uses real backend API endpoints.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface DashboardStats {
    totalEvents: number;
    approvedEvents: number;
    pendingEvents: number;
    totalVolunteers: number;
    totalRegistrations: number;
    newEventsThisWeek: number;
    newPostsThisWeek: number;
}

export const statisticService = {
    /**
     * Get dashboard statistics from backend
     */
    getStatistics: async (): Promise<DashboardStats> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
                headers: getAuthHeader()
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Error fetching statistics:", error);
            throw error;
        }
    },

    /**
     * Get admin dashboard stats - transformed response with fallback
     */
    getAdminDashboardStats: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
                headers: getAuthHeader()
            });
            const data = response.data?.data || response.data;
            
            // Transform backend response to match frontend expectations
            // Admin dashboard cards expect: totalMembers, totalRegistrations, totalEvents, approvedEvents, pendingEvents
            return {
                overview: {
                    totalMembers: data.totalVolunteers || 0,
                    totalRegistrations: data.totalRegistrations || 0,
                    totalEvents: data.totalEvents || 0,
                    approvedEvents: data.approvedEvents || 0,
                    pendingEvents: data.pendingEvents || 0,

                    // Backward-compatible aliases (in case other components used these)
                    totalVolunteers: data.totalVolunteers || 0,
                    pendingApprovals: data.pendingEvents || 0,
                    activeEvents: data.activeEvents || data.approvedEvents || 0,
                },
                chartData: data.chartData || [],
                weeklyData: {
                    newEvents: data.newEventsThisWeek || 0,
                    newVolunteers: data.newVolunteersThisWeek || 0,
                    newPosts: data.newPostsThisWeek || 0,
                }
            };
        } catch (error) {
            console.error("Error in getAdminDashboardStats:", error);
            // Avoid silently returning mock/incorrect data (causes wrong counts on dashboard)
            throw error;
        }
    },

    /**
     * Get leaderboard data
     */
    getLeaderboard: async (metric = 'score', timeframe = 'all', limit = 50, viewerId?: string) => {
        try {
            const params = new URLSearchParams({
                metric,
                timeframe,
                limit: limit.toString(),
            });
            if (viewerId) {
                params.append('viewerId', viewerId);
            }
            
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/leaderboard?${params}`, {
                headers: getAuthHeader()
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            throw error;
        }
    },

    /**
     * Get full dashboard data (top posts, trending events, stats)
     */
    getDashboard: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
                headers: getAuthHeader()
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Error fetching dashboard:", error);
            throw error;
        }
    }
};
