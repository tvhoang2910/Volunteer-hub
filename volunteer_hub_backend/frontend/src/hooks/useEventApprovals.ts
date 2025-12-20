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
            // volunteer.id is the registrationId from useManagerEvent
            const registrationId = volunteer.id;
            if (!registrationId) {
                throw new Error("Không tìm thấy ID đăng ký");
            }
            
            // Backend gets approvedByUserId from JWT token
            await eventService.approveRegistration(registrationId);
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
            // volunteerId is the registrationId
            if (!volunteerId) {
                throw new Error("Không tìm thấy ID đăng ký");
            }
            
            // Backend gets rejectedByUserId from JWT token
            await eventService.rejectRegistration(volunteerId);
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
