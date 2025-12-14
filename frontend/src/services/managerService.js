/**
 * @file managerService.js
 * @description Service for Manager Dashboard functionality.
 * Includes methods for authentication, profile management, stats, notifications, and event approvals.
 * currently uses frontend-only mocks simulating API calls.
 */

import {
  MOCK_PROFILE,
  MONTHLY_STATS,
  MOCK_NEW_EVENTS,
  MOCK_TRENDING,
  NOTIFICATIONS_SEED,
  WALL_GROUPS,
  WALL_POSTS,
  WALL_NOTIFICATIONS,
  MANAGED_EVENTS_SEED,
  PENDING_EVENTS_SEED,
} from "@/data/managerData";

// Mock manager service (frontend-only, returns Promises to simulate API)

export function login(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple mock validation
      if (email === "manager@example.com" || email === "m@example.com") {
        resolve({
          token: "mock-manager-token-123",
          user: { ...MOCK_PROFILE }
        });
      } else {
        reject(new Error("Email hoặc mật khẩu không đúng"));
      }
    }, 500);
  });
}

export function getProfile() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...MOCK_PROFILE }), 250);
  });
}

export function updateProfile(updated) {
  return new Promise((resolve) => {
    // merge into mock and return
    Object.assign(MOCK_PROFILE, updated);
    setTimeout(() => resolve({ ...MOCK_PROFILE }), 300);
  });
}

export function uploadAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file"));
    // create a local object URL to simulate uploaded avatar
    const url = URL.createObjectURL(file);
    setTimeout(() => resolve({ url }), 400);
  });
}

export function updatePreferences(prefs) {
  return new Promise((resolve) => {
    Object.assign(MOCK_PROFILE.preferences, prefs);
    setTimeout(() => resolve({ ...MOCK_PROFILE.preferences }), 200);
  });
}

export function changePassword(payload) {
  return new Promise((resolve, reject) => {
    // very simple mock: require current === 'password'
    if (payload.current !== "password") {
      setTimeout(() => reject(new Error("Current password incorrect")), 200);
    } else {
      setTimeout(() => resolve(true), 300);
    }
  });
}

export function getDashboardStats() {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          monthlyStats: MONTHLY_STATS,
          newEvents: MOCK_NEW_EVENTS,
          trending: MOCK_TRENDING,
          summary: { totalEvents: 12, totalMembers: 540, recentPosts: 18 },
        }),
      300
    );
  });
}

export function getNotifications() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...NOTIFICATIONS_SEED]), 300);
  });
}

export function getWallData() {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          groups: WALL_GROUPS,
          posts: WALL_POSTS,
          notifications: WALL_NOTIFICATIONS,
        }),
      300
    );
  });
}

export function getEvents() {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          managed: MANAGED_EVENTS_SEED,
          pending: PENDING_EVENTS_SEED,
        }),
      300
    );
  });
}

export default {
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePreferences,
  changePassword,
  getDashboardStats,
  getNotifications,
  getWallData,
  getEvents,
};
