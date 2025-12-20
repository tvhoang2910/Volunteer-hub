import axios from 'axios'

// Mock Data
const GROUPS = [
    {
        id: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'Basic concepts of programming and algorithms.',
    },
    {
        id: 'MATH202',
        name: 'Advanced Calculus',
        description: 'Multivariable calculus and differential equations.',
    },
    {
        id: 'ENG301',
        name: 'Creative Writing Workshop',
        description: 'Explore various forms of creative writing.',
    },
    {
        id: 'PHY101',
        name: 'General Physics I',
        description: 'Mechanics, heat, and sound.',
    },
    {
        id: 'CHEM101',
        name: 'General Chemistry I',
        description: 'Atomic structure, bonding, and reactions.',
    },
    {
        id: 'ART101',
        name: 'Art History',
        description: 'Survey of art from prehistoric to modern times.',
    },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const GROUP_SERVICE = {
    getAllGroups: async (page = 1, limit = 9) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/groups?page=${page}&limit=${limit}`, {
                headers: getAuthHeader()
            });
            if (!response.ok) throw new Error("Lỗi khi tải danh sách nhóm");
            return response.data;
        } catch (error) {
            console.error("Error fetching groups:", error);
            // Fallback to mock data if API fails or for demo
            return {
                groups: GROUPS,
                totalPages: Math.ceil(GROUPS.length / limit),
                total: GROUPS.length
            };
        }
    },
    getGroupById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/groups/${id}`, {
                headers: getAuthHeader()
            });
            if (!response.ok) throw new Error("Lỗi khi tải thông tin nhóm");
            return response.data;
        } catch (error) {
            console.error("Error fetching group:", error);
            return null;
        }
    },

    // --- Channel / Event Channel Logic Transferred from channelService.js ---

    /**
     * Get channel info for an event
     * @param {string} eventId
     */
    getChannelInfo: async (eventId) => {
        const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}/channel`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Lock or unlock a channel
     * @param {string} eventId
     * @param {boolean} isLocked
     */
    lockChannel: async (eventId, isLocked) => {
        const response = await axios.put(`${API_BASE_URL}/api/events/${eventId}/channel/lock`, { is_locked: isLocked }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Update channel access settings
     * @param {string} eventId
     * @param {boolean} isAccessible
     */
    updateChannelAccess: async (eventId, isAccessible) => {
        const response = await axios.put(`${API_BASE_URL}/api/events/${eventId}/channel/access`, { is_accessible: isAccessible }, {
            headers: getAuthHeader()
        });
        return response.data;
    }
}

// Alias for backward compatibility if needed, or preferred naming
export const groupService = GROUP_SERVICE;
