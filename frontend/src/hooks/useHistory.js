
import { useState, useEffect, useMemo } from 'react';
import { historyService } from '@/services/historyService';

export const useHistory = () => {
    const [events, setEvents] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [stats, setStats] = useState({
        totalEvents: 0,
        completed: 0,
        interactions: 0,
        thisMonth: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Execute data fetching in parallel
                const [eventsRes, interactionsRes, statsRes] = await Promise.all([
                    historyService.getEvents(),
                    historyService.getInteractions(),
                    historyService.getStats()
                ]);

                setEvents(eventsRes.data);
                setInteractions(interactionsRes.data);
                setStats(statsRes);
            } catch (err) {
                console.error("Failed to fetch history data:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { events, interactions, stats, isLoading, error };
};

export const useHistoryFilter = (events, interactions) => {
    const [dateRange, setDateRange] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || event.status === statusFilter;
            const matchDate = !dateRange ? true : (new Date(event.date) >= dateRange.from && new Date(event.date) <= (dateRange.to || dateRange.from));
            return matchSearch && matchStatus && matchDate;
        });
    }, [events, searchQuery, statusFilter, dateRange]);

    const filteredInteractions = useMemo(() => {
        return interactions.filter(item => {
            const matchSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchType = typeFilter === 'all' || item.type === typeFilter;
            return matchSearch && matchType;
        });
    }, [interactions, searchQuery, typeFilter]);

    const filters = {
        dateRange, setDateRange,
        searchQuery, setSearchQuery,
        statusFilter, setStatusFilter,
        typeFilter, setTypeFilter
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setTypeFilter('all');
        setDateRange(null);
        setSearchQuery('');
    };

    return { filteredEvents, filteredInteractions, filters, clearFilters };
};
