import { useState } from 'react';
import { postService } from '../services/postService';

export const useToggleReaction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleReaction = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await postService.toggleReaction(id);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to toggle reaction');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        toggleReaction,
        loading,
        error
    };
};
