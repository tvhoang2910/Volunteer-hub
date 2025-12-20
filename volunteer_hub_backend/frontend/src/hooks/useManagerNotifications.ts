import { useState, useEffect, useMemo } from "react";
import managerService from "@/services/managerService";

export function useManagerNotifications() {
    const MANAGER_ID = "manager-demo-001";
    const STORAGE_KEY = `notif_read_${MANAGER_ID}`;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await managerService.getNotifications();
                // Initialize unread status
                const initialNotifications = data.map((n) => ({ ...n, unread: true }));
                setNotifications(initialNotifications);

                // Sync with localStorage
                try {
                    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
                    const readSet = new Set(stored);
                    setNotifications((prev) =>
                        prev.map((n) => ({ ...n, unread: !readSet.has(n.id) }))
                    );
                } catch (e) {
                    console.warn("localStorage error:", e);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
        );
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!stored.includes(id)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, id]));
            }
        } catch { }
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        try {
            const allIds = notifications.map((n) => n.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
        } catch { }
    };

    return { notifications, loading, markAsRead, markAllAsRead };
}
