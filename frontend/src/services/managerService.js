/**
 * @file managerService.js
 * @description Service for Manager Dashboard functionality.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const managerService = {
  updatePreferences: async (prefs) => {
    const response = await axios.put(`${API_BASE_URL}/api/users/me/preferences`, prefs, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/manager`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getWallData: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/manager/feed`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getEvents: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/events`, {
      params: { managed: true },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export default managerService;
