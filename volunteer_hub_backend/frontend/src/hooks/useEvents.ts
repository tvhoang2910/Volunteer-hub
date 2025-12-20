import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/services/eventService';

export const useEvents = (initialPage = 1, limit = 9) => {
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
    }), []);

    // Fetch Events with registration status
    const fetchEvents = useCallback(async (page) => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all events
            const response = await eventService.getAllEvents();
            const rawEvents = response.data["data"] || [];
            let events = rawEvents.map(normalizeEvent);
            
            // Fetch user's registered events to mark registration status
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const registeredEvents = await eventService.getMyRegisteredEvents();
                    const registeredEventIds = new Set(
                        registeredEvents.map((e: any) => e.eventId || e.event_id || e.id)
                    );
                    
                    // Merge registration status into events
                    events = events.map(event => ({
                        ...event,
                        registered: registeredEventIds.has(event.event_id)
                    }));
                    
                    console.log("Registered event IDs:", Array.from(registeredEventIds));
                } catch (regErr) {
                    console.warn("Could not fetch registration status:", regErr);
                }
            }
            
            console.log("Fetched and normalized events:", events);

            if (events.length > 0) {
                setAllEvents(events);
                setFeaturedEvents(events.slice(0, 5));
                setTotalPages(Math.max(1, Math.ceil((events.length) / limit)));
                return;
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [limit, normalizeEvent]);

    // Initial Fetch & Mock Setup
    useEffect(() => {
        fetchEvents(currentPage);
    }, [fetchEvents, currentPage]);

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
        console.log("Filtered events:", filtered);
        setFilteredEvents(filtered);
    }, [allEvents, filters]);

    // Pagination: keep current page valid and slice filtered events
    useEffect(() => {
        const total = Math.max(1, Math.ceil(filteredEvents.length / limit));
        if (currentPage > total) {
            setCurrentPage(total);
            return;
        }

        setTotalPages(total);
        const startIndex = (currentPage - 1) * limit;
        const displayedEvents = filteredEvents.slice(startIndex, startIndex + limit);
        console.log("Displayed events:", displayedEvents);
        setDisplayedEvents(displayedEvents);
    }, [filteredEvents, currentPage, limit]);

    // Actions
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const registerEvent = async (eventId) => {
        try {
            await eventService.registerEvent(eventId);
            const updatedEvents = allEvents.map(e =>
                e.event_id === eventId ? { ...e, registered: true } : e
            );
            setAllEvents(updatedEvents);
            setFeaturedEvents(updatedEvents.slice(0, 5));
            return true;
        } catch (err: any) {
            console.error(err);
            // If user is already registered (400 error), update state to reflect that
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already registered')) {
                const updatedEvents = allEvents.map(e =>
                    e.event_id === eventId ? { ...e, registered: true } : e
                );
                setAllEvents(updatedEvents);
                setFeaturedEvents(updatedEvents.slice(0, 5));
            }
            return false;
        }
    };

    const cancelRegistration = async (eventId) => {
        try {
            await eventService.cancelRegistration(eventId);
            const updatedEvents = allEvents.map(e =>
                e.event_id === eventId ? { ...e, registered: false } : e
            );
            setAllEvents(updatedEvents);
            setFeaturedEvents(updatedEvents.slice(0, 5));
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
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
        registerEvent,
        cancelRegistration
    };
};
