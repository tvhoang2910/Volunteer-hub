import { useState, useEffect } from "react";
import managerService from "@/services/managerService";
import { eventService } from "@/services/eventService";

export function useManagerEvents() {
    const [managedEvents, setManagedEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await managerService.getEvents();
                console.log("Full response from backend:", response);
                console.log("Response data:", response.data);
                
                const allEvents = response.data || [];
                console.log("All events:", allEvents);
                
                // Filter events based on status
                // APPROVED events go to managedEvents
                // PENDING events go to pendingEvents
                const managed = allEvents.filter(event => event.status === "APPROVED");
                const pending = allEvents.filter(event => event.status === "PENDING");
                
                console.log("Managed events:", managed);
                console.log("Pending events:", pending);
                
                setManagedEvents(managed);
                setPendingEvents(pending);
            } catch (error) {
                console.error("Failed to fetch events", error);
                console.error("Error response:", error.response);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (tab, index) => {
        const eventList = tab === "managed" ? managedEvents : pendingEvents;
        const eventToDelete = eventList[index];

        if (!eventToDelete || !eventToDelete.id) {
            console.error("Cannot delete event: Missing ID", eventToDelete);
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn xóa dự án "${eventToDelete.title}"?`)) return;

        try {
            await eventService.deleteEvent(eventToDelete.id);
            
            if (tab === "managed") {
                setManagedEvents((prev) => prev.filter((_, i) => i !== index));
            } else {
                setPendingEvents((prev) => prev.filter((_, i) => i !== index));
            }
            setAlert({ type: "success", message: "Dự án đã được xóa thành công." });
        } catch (error) {
            console.error("Failed to delete event", error);
            setAlert({ 
                type: "error", 
                message: error.response?.data?.message || "Không thể xóa dự án. Vui lòng thử lại sau." 
            });
        }
    };

    const handleSaveEvent = (newEvent, editingContext) => {
        if (editingContext) {
            if (editingContext.tab === "managed") {
                setManagedEvents((prev) =>
                    prev.map((evt, i) =>
                        i === editingContext.index
                            ? { ...evt, ...newEvent, status: evt.status }
                            : evt
                    )
                );
            } else {
                setPendingEvents((prev) =>
                    prev.map((evt, i) =>
                        i === editingContext.index
                            ? { ...evt, ...newEvent, status: evt.status }
                            : evt
                    )
                );
            }

            setAlert({ type: "success", message: "Cập nhật dự án thành công!" });
        } else {
            setPendingEvents((prev) => [newEvent, ...prev]);
            setAlert({ type: "success", message: "Tạo dự án mới thành công!" });
        }
    };

    const closeAlert = () => setAlert(null);

    return {
        managedEvents,
        pendingEvents,
        loading,
        alert,
        handleDelete,
        handleSaveEvent,
        closeAlert,
    };
}
