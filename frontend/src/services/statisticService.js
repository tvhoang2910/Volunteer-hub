/**
 * @file statisticService.js
 * @description Service for fetching application statistics (dashboard data).
 * Covers both public and admin dashboard statistics with mock fallback.
 */

import { MOCK_DASHBOARD_STATS } from '@/data/statisticData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const statisticService = {
    getStatistics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/statistic`, {
                method: "GET",
            });
            if (!response.ok) {
                // If backend fails or not implemented, return mock data for now 
                // to prevent breaking the UI during refactor if the user hasn't set up the API yet.
                // However, the original code had a specific structure { flights, tickets, revenue }.
                // We should probably keep that if it's being used elsewhere, 
                // but based on the request, we are refactoring *dashboard.jsx*.
                console.warn("Fetching statistics failed, returning mock/empty data");
                throw new Error("Send request failed");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching statistics:", error);
            throw error;
        }
    },

    getAdminDashboardStats: async () => {
        // In a real app, this would be an API call.
        // mimicking network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_DASHBOARD_STATS);
            }, 500);
        });

        /* 
        // Real implementation would be:
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, { method: "GET" });
            if (!response.ok) throw new Error("Failed to fetch dashboard stats");
            return await response.json();
        } catch (error) {
            console.error("Error in getAdminDashboardStats:", error);
            throw error;
        }
        */
    }
};
