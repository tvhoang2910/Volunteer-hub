import { useState, useEffect } from "react";
import { eventService } from "@/services/eventService";

export const useEventApprovals = (event, eventId) => {
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        if (event) {
            setPending(event.pendingVolunteers || []);
            setApproved([]);
        }
    }, [event]);

    const approve = async (volunteer) => {
        setLoadingAction(true);
        try {
            await eventService.approveRegistration(eventId, volunteer.id, "mock-token");
            setPending((prev) => prev.filter((item) => item.id !== volunteer.id));
            setApproved((prev) => [volunteer, ...prev]);
            return { success: true, volunteer };
        } catch (error) {
            console.error("Approval failed", error);
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    const reject = async (volunteerId) => {
        setLoadingAction(true);
        try {
            await eventService.rejectRegistration(eventId, volunteerId, "mock-token");
            setPending((prev) => prev.filter((item) => item.id !== volunteerId));
            return { success: true, volunteerId };
        } catch (error) {
            console.error("Rejection failed", error);
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    return { pending, approved, approve, reject, loadingAction };
};
