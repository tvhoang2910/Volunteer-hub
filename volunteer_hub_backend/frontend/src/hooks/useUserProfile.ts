import { useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '@/services/userService';

// Simple in-memory cache for user profile
interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    [key: string]: any;
}

interface CacheEntry {
    data: UserProfile;
    timestamp: number;
}

// Global cache object - persists across component mounts
const userCache: { [key: string]: CacheEntry } = {};
const CACHE_DURATION = 30000; // 30 seconds

// Global promise to prevent concurrent requests
let pendingRequest: Promise<UserProfile | null> | null = null;

/**
 * Custom hook to fetch and cache user profile data.
 * Prevents duplicate API calls across multiple components.
 */
export default function useUserProfile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const mountedRef = useRef(true);

    const fetchUser = useCallback(async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setLoading(false);
                return null;
            }

            // Check cache first
            const cached = userCache[userId];
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                if (mountedRef.current) {
                    setUser(cached.data);
                    setLoading(false);
                }
                return cached.data;
            }

            // If there's already a pending request, wait for it
            if (pendingRequest) {
                const result = await pendingRequest;
                if (mountedRef.current) {
                    setUser(result);
                    setLoading(false);
                }
                return result;
            }

            // Create new request
            pendingRequest = (async () => {
                try {
                    const response = await userService.getUserById(userId);
                    const userData: UserProfile = {
                        id: response.data?.userId || userId,
                        name: response.data?.name || '',
                        email: response.data?.email || '',
                        avatarUrl: response.data?.avatarUrl || null,
                        ...response.data,
                    };

                    // Update cache
                    userCache[userId] = {
                        data: userData,
                        timestamp: Date.now(),
                    };

                    return userData;
                } finally {
                    pendingRequest = null;
                }
            })();

            const result = await pendingRequest;
            
            if (mountedRef.current) {
                setUser(result);
                setLoading(false);
            }
            
            return result;
        } catch (err) {
            console.error('Error fetching user profile:', err);
            if (mountedRef.current) {
                setError(err as Error);
                setLoading(false);
            }
            pendingRequest = null;
            return null;
        }
    }, []);

    // Force refresh - bypasses cache
    const refresh = useCallback(async () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            delete userCache[userId];
        }
        pendingRequest = null;
        setLoading(true);
        return fetchUser();
    }, [fetchUser]);

    // Update avatar in cache
    const updateAvatar = useCallback((newAvatarUrl: string) => {
        const userId = localStorage.getItem('userId');
        if (userId && userCache[userId]) {
            userCache[userId].data.avatarUrl = newAvatarUrl;
            userCache[userId].timestamp = Date.now();
        }
        setUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchUser();

        return () => {
            mountedRef.current = false;
        };
    }, [fetchUser]);

    return {
        user,
        loading,
        error,
        refresh,
        updateAvatar,
    };
}

// Helper to clear cache (useful for logout)
export function clearUserCache() {
    Object.keys(userCache).forEach(key => delete userCache[key]);
    pendingRequest = null;
}
