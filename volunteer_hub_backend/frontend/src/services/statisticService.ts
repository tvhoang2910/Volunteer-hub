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
     * Get admin dashboard stats - uses the same endpoint
     */
    getAdminDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
                headers: getAuthHeader()
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Error in getAdminDashboardStats:", error);
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
