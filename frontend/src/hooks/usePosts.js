import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';

export const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = useCallback(async (pageNum = 1, isRefresh = false) => {
        try {
            setLoading(true);
            const response = await postService.getPosts(pageNum);

            if (isRefresh) {
                setPosts(response.data);
            } else {
                setPosts(prev => [...prev, ...response.data]);
            }

            setHasMore(response.hasMore);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(1, true);
    }, [fetchPosts]);

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage, false);
        }
    };

    const refresh = () => {
        setPage(1);
        setHasMore(true);
        fetchPosts(1, true);
    };

    // Helper to manually update local state (e.g. after create/delete/update)
    const setLocalPosts = (callback) => {
        setPosts(callback);
    };

    return {
        posts,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        setPosts: setLocalPosts
    };
};
