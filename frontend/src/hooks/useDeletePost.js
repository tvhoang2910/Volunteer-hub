import { useState } from 'react';
import { postService } from '../services/postService';

export const useDeletePost = (onSuccess) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deletePost = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await postService.deletePost(id);
            if (onSuccess) {
                onSuccess(id);
            }
        } catch (err) {
            setError(err.message || 'Failed to delete post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        deletePost,
        loading,
        error
    };
};
