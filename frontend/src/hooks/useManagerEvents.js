import { useState, useEffect } from "react";
import managerService from "@/services/managerService";

export function useManagerEvents() {
    const [managedEvents, setManagedEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await managerService.getEvents();
                setManagedEvents(data.managed);
                setPendingEvents(data.pending);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = (tab, index) => {
        if (!window.confirm("Bạn có chắc muốn xóa dự án này?")) return;
        if (tab === "managed") {
            setManagedEvents((prev) => prev.filter((_, i) => i !== index));
        } else {
            setPendingEvents((prev) => prev.filter((_, i) => i !== index));
        }
        setAlert({ type: "success", message: "Dự án đã được xóa." });
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
