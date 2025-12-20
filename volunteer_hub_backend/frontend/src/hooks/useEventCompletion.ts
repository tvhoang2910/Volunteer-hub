import { useState, useEffect, useMemo } from "react";
import { eventService } from "@/services/eventService";

const defaultEvaluations = (event) =>
    event?.volunteers?.reduce((acc, vol) => {
        // Check if volunteer already has completed status
        acc[vol.id] = vol.registrationStatus === "COMPLETED" ? "completed" : "pending";
        return acc;
    }, {}) ?? {};

export const useEventCompletion = (event, eventId) => {
    const [evaluations, setEvaluations] = useState({});
    const [notes, setNotes] = useState({});
    const [savedAt, setSavedAt] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (event) {
            setEvaluations(defaultEvaluations(event));
            setNotes({});
            setSavedAt(null);
        }
    }, [event]);

    const stats = useMemo(() => {
        const values = Object.values(evaluations);
        const completed = values.filter((value) => value === "completed").length;
        const pending = values.filter((value) => value !== "completed").length;
        return { completed, pending };
    }, [evaluations]);

    const evaluate = (volId, value) => {
        setEvaluations((prev) => ({ ...prev, [volId]: value }));
    };

    const updateNote = (volId, text) => {
        setNotes((prev) => ({ ...prev, [volId]: text }));
    };

    const saveEvaluations = async () => {
        setLoading(true);
        try {
            // Filter only volunteers marked as "completed"
            const completedVolunteers = Object.entries(evaluations)
                .filter(([, status]) => status === "completed");
            
            // Call complete registration API for each completed volunteer
            // volId here is the registrationId from useManagerEvent
            const updates = completedVolunteers.map(([volId]) => {
                const note = notes[volId] || "";
                return eventService.completeRegistration(volId, note);
            });
            
            await Promise.all(updates);
            const time = new Date().toLocaleTimeString("vi-VN");
            setSavedAt(time);
            return { success: true, time };
        } catch (error) {
            console.error("Save failed", error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    return {
        evaluations,
        notes,
        savedAt,
        stats,
        evaluate,
        updateNote,
        saveEvaluations,
        loading,
    };
};
