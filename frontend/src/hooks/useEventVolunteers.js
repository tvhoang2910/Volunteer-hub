import { useState, useEffect, useMemo } from "react";
import { eventService } from "@/services/eventService";

export const useEventVolunteers = (event, eventId) => {
    const [volunteers, setVolunteers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (event) {
            setVolunteers(event.volunteers || []);
        }
    }, [event]);

    const filteredVolunteers = useMemo(() => {
        if (!search) return volunteers;
        const keyword = search.toLowerCase();
        return volunteers.filter(
            (vol) =>
                vol.name.toLowerCase().includes(keyword) ||
                (vol.role && vol.role.toLowerCase().includes(keyword))
        );
    }, [volunteers, search]);

    const changeStatus = (id, newStatus) => {
        setVolunteers((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
    };

    const saveVolunteers = async () => {
        try {
            // In a real app, you would send the updated list or changes to the backend
            // await eventService.updateVolunteersList(eventId, volunteers);
            console.log("Saving volunteers list:", volunteers);
            return { success: true };
        } catch (error) {
            console.error("Save failed", error);
            return { success: false, error };
        }
    };

    return {
        volunteers,
        filteredVolunteers,
        search,
        setSearch,
        changeStatus,
        saveVolunteers,
    };
};
