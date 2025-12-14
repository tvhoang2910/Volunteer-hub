import { useState, useEffect, useMemo } from "react";
import { eventService } from "@/services/eventService";

const defaultEvaluations = (event) =>
    event?.volunteers.reduce((acc, vol) => {
        acc[vol.id] = "pending";
        return acc;
    }, {}) ?? {};

export const useEventCompletion = (event, eventId) => {
    const [evaluations, setEvaluations] = useState({});
    const [notes, setNotes] = useState({});
    const [savedAt, setSavedAt] = useState(null);

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
        try {
            const updates = Object.entries(evaluations).map(([volId, status]) =>
                eventService.updateVolunteerStatus(eventId, volId, status, "mock-token")
            );
            await Promise.all(updates);
            const time = new Date().toLocaleTimeString("vi-VN");
            setSavedAt(time);
            return { success: true, time };
        } catch (error) {
            console.error("Save failed", error);
            return { success: false, error };
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
    };
};
