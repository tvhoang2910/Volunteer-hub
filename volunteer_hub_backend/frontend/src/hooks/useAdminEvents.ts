import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/services/eventService';
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

export const useAdminEvents = () => {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const parseMaybeTimestamp = (value) => {
        if (!value) return null;
        if (typeof value === 'string' || typeof value === 'number') return new Date(value);
        // Firestore Timestamp-like { seconds, nanoseconds }
        if (value.seconds) return new Date(value.seconds * 1000);
        // Date-like string field
        return new Date(value);
    };

    const fetchEvents = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin');
            return;
        }

        setIsLoading(true);
        try {
            const res = await eventService.getAllEventsAdmin(token);
            const serverEvents = res?.data?.events || res?.events || [];
            setEvents(serverEvents.map(e => ({
                event_id: e.event_id || e.id,
                created_by_user_id: e.created_by_user_id,
                title: e.title,
                description: e.description,
                location: e.location,
                start_time: parseMaybeTimestamp(e.start_time),
                end_time: parseMaybeTimestamp(e.end_time),
                max_volunteers: e.max_volunteers,
                admin_approval_status: e.admin_approval_status || 'Pending',
                is_archived: !!e.is_archived,
                created_at: parseMaybeTimestamp(e.created_at),
            })));
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách sự kiện. Vui lòng thử lại.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const removeEvent = async (eventId) => {
        const token = localStorage.getItem('token');
        const previous = events;
        setEvents(events.filter(ev => ev.event_id !== eventId));

        try {
            await eventService.deleteEvent(eventId, token);
            toast({
                title: "Thông báo",
                description: "Sự kiện đã được xóa thành công.",
            });
        } catch (error) {
            setEvents(previous);
            toast({
                title: "Xóa sự kiện không thành công",
                description: "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng thử lại.",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        events,
        isLoading,
        removeEvent,
        refreshEvents: fetchEvents
    };
};
