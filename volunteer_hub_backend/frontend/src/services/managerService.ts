/**
 * @file managerService.js
 * @description Service for Manager Dashboard functionality.
 * Includes methods for authentication, profile management, stats, notifications, and event approvals.
 * currently uses frontend-only mocks simulating API calls.
 */

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  return response.data;
}

export async function getProfile(userId) {
  const response = await axios.get(`${API_BASE_URL}/api/users`, {
    headers: getAuthHeader()
  });
  return response.data;
}

export async function updateProfile(updated) {
  // Backend gets userId from JWT token
  const response = await axios.put(`${API_BASE_URL}/api/users/profile`, updated, {
    headers: getAuthHeader()
  });
  return response.data;
}

// export function uploadAvatar(file) {
//   return new Promise((resolve, reject) => {
//     if (!file) return reject(new Error("No file"));
//     // create a local object URL to simulate uploaded avatar
//     const url = URL.createObjectURL(file);
//     setTimeout(() => resolve({ url }), 400);
//   });
// }

// export function updatePreferences(prefs) {
//   return new Promise((resolve) => {
//     Object.assign(MOCK_PROFILE.preferences, prefs);
//     setTimeout(() => resolve({ ...MOCK_PROFILE.preferences }), 200);
//   });
// }

// export function changePassword(payload) {
//   return new Promise((resolve, reject) => {
//     // very simple mock: require current === 'password'
//     if (payload.current !== "password") {
//       setTimeout(() => reject(new Error("Current password incorrect")), 200);
//     } else {
//       setTimeout(() => resolve(true), 300);
//     }
//   });
// }

// export function getDashboardStats() {
//   return new Promise((resolve) => {
//     setTimeout(
//       () =>
//         resolve({
//           monthlyStats: MONTHLY_STATS,
//           newEvents: MOCK_NEW_EVENTS,
//           trending: MOCK_TRENDING,
//           summary: { totalEvents: 12, totalMembers: 540, recentPosts: 18 },
//         }),
//       300
//     );
//   });
// }

// export function getNotifications() {
//   return new Promise((resolve) => {
//     setTimeout(() => resolve([...NOTIFICATIONS_SEED]), 300);
//   });
// }

// export function getWallData() {
//   return new Promise((resolve) => {
//     setTimeout(
//       () =>
//         resolve({
//           groups: WALL_GROUPS,
//           posts: WALL_POSTS,
//           notifications: WALL_NOTIFICATIONS,
//         }),
//       300
//     );
//   });
// }

export async function getDashboardStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/events/my-events`, {
      headers: getAuthHeader()
    });
    
    const events = response.data || [];
    return {
      summary: {
        totalEvents: events.length || 0,
        totalMembers: events.reduce((sum, e) => sum + (e.participants?.length || 0), 0),
        recentPosts: 0
      },
      newEvents: events.slice(0, 5) || [],
      trending: [],
      monthlyStats: []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      summary: {
        totalEvents: 0,
        totalMembers: 0,
        recentPosts: 0
      },
      newEvents: [],
      trending: [],
      monthlyStats: []
    };
  }
}

export async function getEvents() {
  const response = await axios.get(`${API_BASE_URL}/api/events/my-events`, {
    headers: getAuthHeader()
  });
  return response.data;
}

export default {
  login,
  getProfile,
  updateProfile,
  getDashboardStats,
  getEvents,
};
