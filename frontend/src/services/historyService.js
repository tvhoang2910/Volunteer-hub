
import { MOCK_EVENTS, MOCK_INTERACTIONS } from '@/data/history-mock';

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const historyService = {
    getEvents: async (filters = {}) => {
        await delay(800); // Simulate network latency
        // In a real app, filters would be passed to the API
        return {
            data: MOCK_EVENTS,
            total: MOCK_EVENTS.length
        };
    },

    getInteractions: async (filters = {}) => {
        await delay(600);
        return {
            data: MOCK_INTERACTIONS,
            total: MOCK_INTERACTIONS.length
        };
    },

    getStats: async () => {
        await delay(500);
        return {
            totalEvents: MOCK_EVENTS.length,
            completed: MOCK_EVENTS.filter(e => e.status === 'completed').length,
            interactions: MOCK_INTERACTIONS.length,
            thisMonth: 2 // Hardcoded for demo
        };
    }
};
