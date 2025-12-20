
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
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, skipping event fetch');
                setIsLoading(false);
                return;
            }
            console.log('Fetching events from /api/users/events');
            await historyService.getEvents().then(response => {
                setEvents(response.data.data);
            }).catch(err => {
                console.error('Error fetching events:', err);
                setError(err);
            }).finally(() => {
                setIsLoading(false);
            });
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
        return events.filter(item => {
            const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchDate = !dateRange || (new Date(item.date) >= dateRange[0] && new Date(item.date) <= dateRange[1]);
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
