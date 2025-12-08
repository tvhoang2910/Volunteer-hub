
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Mock data to replace hardcoded data in components until backend is ready
const MOCK_DASHBOARD_DATA = {
    overview: {
        totalMembers: 15500,
        totalEvents: 3300,
        growthRate: 24,
        lockedAccounts: 42,
        memberGrowth: 12.5,
        eventGrowth: 8.2,
        growthRateChange: 12.5,
        lockedAccountsChange: -6.8
    },
    chartData: [
        { month: "January", pageViews: 3200, orders: 2400, desktop: 73 },
        { month: "February", pageViews: 2800, orders: 1800, desktop: 85 },
        { month: "March", pageViews: 4200, orders: 3200, desktop: 214 },
        { month: "April", pageViews: 3600, orders: 2600, desktop: 73 },
        { month: "May", pageViews: 4500, orders: 3400, desktop: 209 },
        { month: "June", pageViews: 3900, orders: 2900, desktop: 214 },
        { month: "July", pageViews: 4100, orders: 3100, desktop: 110 },
        { month: "August", pageViews: 3700, orders: 2700, desktop: 100 },
        { month: "September", pageViews: 4300, orders: 3300, desktop: 136 },
        { month: "October", pageViews: 3500, orders: 2500, desktop: 118 },
        { month: "November", pageViews: 4600, orders: 3600, desktop: 190 },
        { month: "December", pageViews: 4000, orders: 3000, desktop: 120 },
    ],
    weeklyData: [
        { day: "Monday", pageViews: 3200, orders: 2400 },
        { day: "Tuesday", pageViews: 2800, orders: 1800 },
        { day: "Wednesday", pageViews: 4200, orders: 3200 },
        { day: "Thursday", pageViews: 3800, orders: 2800 },
        { day: "Friday", pageViews: 4800, orders: 3800 },
        { day: "Saturday", pageViews: 3400, orders: 2200 },
        { day: "Sunday", pageViews: 4000, orders: 3000 },
    ],
    eventTypeData: [
        { name: 'Giáo dục', value: 3 },
        { name: 'Môi trường', value: 6 },
        { name: 'Y tế', value: 3 },
        { name: 'Cộng đồng', value: 5 }
    ]
};

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
                resolve(MOCK_DASHBOARD_DATA);
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
