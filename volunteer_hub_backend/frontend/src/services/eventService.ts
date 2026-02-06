/**
 * @file eventService.js
 * @description Event service (User + Admin)
 */
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  console.log('[EventService] Token from localStorage:', token ? 'exists' : 'missing');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const eventService = {
  /* USER */

  getAllEvents: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/events`, { 
      params,
      headers: getAuthHeader()
    });
    return res;
  },

  getEventDetails: async (eventId) => {
    const res = await axios.get(`${API_BASE_URL}/api/events/${eventId}`, {
      headers: getAuthHeader()
    });
    // API returns {data: {...}, message, detail} - extract actual event data
    return res.data?.data || res.data;
  },

  registerEvent: async (eventId) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/events/${eventId}/participants`,
      {},
      { 
        headers: getAuthHeader(),
        withCredentials: true
      }
    );
    return res.data;
  },

  cancelRegistration: async (eventId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/api/events/${eventId}/participants`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  getParticipants: async (eventId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/events/${eventId}/participants`,
      { headers: getAuthHeader() }
    );
    return res.data?.data || [];
  },

  // Approve a registration (manager approves volunteer)
  // Backend gets approvedByUserId from JWT token
  approveRegistration: async (registrationId) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/registrations/${registrationId}/approve`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Reject a registration
  // Backend gets rejectedByUserId from JWT token
  rejectRegistration: async (registrationId) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/registrations/${registrationId}/reject`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Complete a registration (mark volunteer as completed)
  // Backend gets completedByUserId from JWT token
  completeRegistration: async (registrationId, completionNotes = '') => {
    const res = await axios.put(
      `${API_BASE_URL}/api/registrations/${registrationId}/complete`,
      { completionNotes },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Uncomplete a registration (revert to APPROVED status)
  uncompleteRegistration: async (registrationId) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/registrations/${registrationId}/uncomplete`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Get current user's registered events
  getMyRegisteredEvents: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/api/users/events`,
      { headers: getAuthHeader() }
    );
    return res.data?.data || [];
  },

  /* MANAGER */

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    console.log('[EventService] Updating event:', eventId, eventData);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/events/${eventId}`,
        eventData,
        { headers: getAuthHeader() }
      );
      console.log('[EventService] Event updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('[EventService] Error updating event:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  createEvent: async (eventData, token) => {
    console.log('[EventService] Creating event with data:', eventData);
    const headers = token ? { Authorization: `Bearer ${token}` } : getAuthHeader();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/events`,
        eventData,
        { headers }
      );
      console.log('[EventService] Event created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('[EventService] Error creating event:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  /* ADMIN */

  getAllEventsAdmin: async () => {
    const normalizeAdminEvent = (event = {}) => ({
      id: event.id || event.event_id,
      name: event.name || event.title || '',
      category: event.category || '',
      // Use adminApprovalStatus if available, fallback to status
      status: event.adminApprovalStatus || event.status || 'PENDING',
      createdBy: event.createdBy || event.creatorName || '',
      location: event.location || '',
      startDate: event.startDate || event.start_time || '',
      endDate: event.endDate || event.end_time || '',
      description: event.description || '',
      volunteerCount: event.volunteerCount ?? 0,
      pendingRegistrations: event.pendingRegistrations ?? 0,
      notes: event.notes || '',
      thumbnailUrl: event.thumbnailUrl || null,
    });

    const res = await axios.get(`${API_BASE_URL}/api/admin/events`, {
      headers: getAuthHeader(),
    });

    const rawEvents = res.data?.data || res.data || [];

    return rawEvents.map(normalizeAdminEvent);
  },

  // Get pending events for admin
  getPendingEvents: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/events/pending`, {
      headers: getAuthHeader(),
    });
    return res.data?.data || res.data || [];
  },

  approveEvent: async (eventId) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/admin/events/${eventId}/approve`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  rejectEvent: async (eventId, reason) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/admin/events/${eventId}/reject`,
      { reason },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  deleteEvent: async (eventId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/api/events/${eventId}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  getUpcomingEventsCount: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/events/upcoming-count`, {
      headers: getAuthHeader()
    });
    const data = res.data?.data;
    // Backend returns { data: [...], message: "...", detail: null }
    // So we need to get array length
    return Array.isArray(data) ? data.length : 0;
  },

  getRegisteredEventsCount: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/events/registered-events-count`, {
      headers: getAuthHeader()
    });
    // Backend returns { data: number, message: "...", detail: null }
    return res.data?.data || 0;
  },
};
