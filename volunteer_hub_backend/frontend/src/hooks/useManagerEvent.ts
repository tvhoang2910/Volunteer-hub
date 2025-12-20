import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";
// import { getManagerEventByRouteId } from "@/data/managerEvents"; // Remove mock
import { eventService } from "@/services/eventService";

const normalizeRouteParam = (value) => {
  if (value === undefined) return null;
  return Array.isArray(value) ? value[0] : value;
};

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (id: string | null): boolean => {
  if (!id) return false;
  return UUID_REGEX.test(id);
};

export const useManagerEvent = () => {
  const router = useRouter();
  const rawId = normalizeRouteParam(router.query.id);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady && rawId) {
      // Validate UUID format before calling API
      if (!isValidUUID(rawId)) {
        console.error(`[useManagerEvent] Invalid event ID format: ${rawId}. Expected UUID.`);
        setError(`Invalid event ID format: ${rawId}`);
        setLoading(false);
        setEvent(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      Promise.all([
        eventService.getEventDetails(rawId),
        eventService.getParticipants(rawId)
      ])
        .then(([data, participants]) => {
          const participantsList = participants || [];
          
          // Filter participants by registration status
          const pendingVolunteers = participantsList
            .filter(p => p.registrationStatus === 'PENDING')
            .map(p => ({
              id: p.registrationId || p.id,
              oderId: p.userId,
              name: p.userName || p.name || 'Unknown',
              email: p.email || '',
              submittedAt: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : 'N/A',
              motivation: p.motivation || 'Không có lý do',
              registrationStatus: p.registrationStatus
            }));
          
          const approvedVolunteers = participantsList
            .filter(p => p.registrationStatus === 'APPROVED')
            .map(p => ({
              id: p.registrationId || p.id,
              userId: p.userId,
              name: p.userName || p.name || 'Unknown',
              email: p.email || '',
              joinedAt: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : 'N/A',
              isActive: p.isUserActive ?? true,
              registrationStatus: p.registrationStatus
            }));

          // Build full thumbnail URL for heroImage
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
          const heroImage = data.thumbnailUrl 
            ? (data.thumbnailUrl.startsWith('http') ? data.thumbnailUrl : `${API_BASE_URL}${data.thumbnailUrl}`)
            : null;

          // Normalize data from backend to match frontend expectations
          const normalizedEvent = {
            ...data,
            heroImage, // Map thumbnailUrl to heroImage for EventDetailLayout
            organizer: {
              name: data.createdByName || "Chưa cập nhật",
              organization: "Volunteer Hub" // Default or fetch from user profile
            },
            timeline: {
              start: data.startTime ? new Date(data.startTime).toLocaleString('vi-VN') : "Chưa cập nhật",
              end: data.endTime ? new Date(data.endTime).toLocaleString('vi-VN') : "Chưa cập nhật"
            },
            volunteersNeeded: data.maxVolunteers || 0,
            volunteers: approvedVolunteers, // Only show approved volunteers in main list
            pendingVolunteers: pendingVolunteers, // Add pending volunteers for approval page
            allParticipants: participantsList, // Keep all participants for reference
            tags: data.tags || ["Tình nguyện", "Cộng đồng"], // Default tags
            subtitle: data.category || "Sự kiện cộng đồng",
            mission: data.description || "Chưa có mô tả nhiệm vụ",
            contact: {
              phone: data.contactPhone || "Chưa cập nhật",
              email: data.contactEmail || "Chưa cập nhật"
            }
          };
          console.log('[useManagerEvent] Normalized event:', normalizedEvent);
          console.log('[useManagerEvent] Pending volunteers:', pendingVolunteers);
          setEvent(normalizedEvent);
        })
        .catch(err => {
          console.error('[useManagerEvent] Error fetching event:', err);
          setError(err.message || 'Failed to fetch event');
        })
        .finally(() => setLoading(false));
    }
  }, [rawId, router.isReady]);

  return { event, eventId: rawId, isReady: router.isReady && !loading, error };
};
