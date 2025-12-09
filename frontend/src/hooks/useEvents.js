import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/services/eventService';

export const useEvents = (initialPage = 1, limit = 9) => {
    const [allEvents, setAllEvents] = useState([]);
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
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

    // Fetch Events
    const fetchEvents = useCallback(async (page) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await eventService.getAllEvents(page, limit);
            if (data.events && data.events.length > 0) {
                setAllEvents(data.events);
                setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limit));
            } else {
                // Fallback to mocks
                const mocks = eventService.getMockEvents();
                setAllEvents(mocks);
                setTotalPages(1);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
            // Fallback to mocks
            const mocks = eventService.getMockEvents();
            setAllEvents(mocks);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial Fetch & Mock Setup
    useEffect(() => {
        fetchEvents(currentPage);
        const mocks = eventService.getMockEvents();
        setFeaturedEvents(mocks);
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
        setFilteredEvents(filtered);
    }, [allEvents, filters]);

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
            setFeaturedEvents(updatedEvents);
            return true;
        } catch (err) {
            console.error(err);
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
            setFeaturedEvents(updatedEvents);
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
