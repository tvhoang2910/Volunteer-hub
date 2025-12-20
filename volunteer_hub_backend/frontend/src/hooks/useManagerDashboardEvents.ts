import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/services/eventService';

export const useManagerDashboardEvents = (initialPage = 1, limit = 9) => {
    const [allEvents, setAllEvents] = useState([]);
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        category: "all",
        location: "all",
        search: ""
    });
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Normalize event data from various API formats
    const normalizeEvent = useCallback((event: any = {}) => ({
        ...event,
        event_id: event.event_id || event.eventId || event.id,
        title: event.title || "Sự kiện",
        description: event.description || "",
        location: event.location || "Chưa cập nhật",
        start_time: event.start_time || event.startTime || "",
        end_time: event.end_time || event.endTime || "",
        registration_deadline: event.registration_deadline || event.registrationDeadline || event.end_time || event.endTime || "",
        current_volunteers: event.current_volunteers ?? event.currentVolunteers ?? event.registrationCount ?? 0,
        max_volunteers: event.max_volunteers ?? event.maxVolunteers ?? 0,
        category: event.category || "Tình nguyện",
        image: event.image || event.thumbnailUrl || "",
        status: event.status || "PENDING",
    }), []);

    // Fetch all events (same as volunteer dashboard)
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all events
            const response = await eventService.getAllEvents();
            const rawEvents = response.data["data"] || [];
            let events = rawEvents.map(normalizeEvent);
            
            console.log("Manager fetched all events:", events);

            setAllEvents(events);
            setFeaturedEvents(events.slice(0, 4)); // Show 4 featured events
            setTotalPages(Math.max(1, Math.ceil(events.length / limit)));
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [limit, normalizeEvent]);

    // Initial Fetch
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Filter Logic
    useEffect(() => {
        const filtered = allEvents.filter((event) => {
            // Date range
            let dateMatch = true;
            if (filters.startDate || filters.endDate) {
                const eventDate = new Date(event.start_time);
                if (filters.startDate && filters.endDate) {
                    dateMatch = eventDate >= new Date(filters.startDate) && eventDate <= new Date(filters.endDate);
                } else if (filters.startDate) {
                    dateMatch = eventDate >= new Date(filters.startDate);
                } else if (filters.endDate) {
                    dateMatch = eventDate <= new Date(filters.endDate);
                }
            }

            const categoryMatch = filters.category === "all" || event.category === filters.category;
            const locationMatch = filters.location === "all" || event.location === filters.location;

            const q = (filters.search || "").toLowerCase().trim();
            const text = [event.title, event.description, event.location].filter(Boolean).join(" ").toLowerCase();
            const searchMatch = q === "" || text.includes(q);

            return dateMatch && categoryMatch && locationMatch && searchMatch;
        });
        setFilteredEvents(filtered);
    }, [allEvents, filters]);

    // Pagination
    useEffect(() => {
        const total = Math.max(1, Math.ceil(filteredEvents.length / limit));
        if (currentPage > total) {
            setCurrentPage(total);
            return;
        }

        setTotalPages(total);
        const startIndex = (currentPage - 1) * limit;
        const displayed = filteredEvents.slice(startIndex, startIndex + limit);
        setDisplayedEvents(displayed);
    }, [filteredEvents, currentPage, limit]);

    // Actions
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            category: "all",
            location: "all",
            search: ""
        });
    };

    const refreshEvents = () => {
        fetchEvents();
    };

    return {
        allEvents,
        featuredEvents,
        filteredEvents,
        displayedEvents,
        filters,
        setFilters,
        resetFilters,
        currentPage,
        totalPages,
        handlePageChange,
        isLoading,
        error,
        refreshEvents,
    };
};
