import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";
// import { getManagerEventByRouteId } from "@/data/managerEvents"; // Remove mock
import { eventService } from "@/services/eventService";

const normalizeRouteParam = (value) => {
  if (value === undefined) return null;
  return Array.isArray(value) ? value[0] : value;
};

export const useManagerEvent = () => {
  const router = useRouter();
  const rawId = normalizeRouteParam(router.query.id);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.isReady && rawId) {
      setLoading(true);
      eventService.getEventDetails(rawId)
        .then(data => {
          // Determine volunteer lists from data or separate call
          // For now assume data contains volunteers or we fetch them using getEventRegistrations
          // Let's chain fetching registrations if needed, or assume mock service returns them.
          // Merging data for the hook:
          setEvent(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [rawId, router.isReady]);

  return { event, eventId: rawId, isReady: router.isReady && !loading };
};
