import { useState } from 'react';
import { postService } from '../services/postService';

export const useUpdatePost = (onSuccess) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updatePost = async (id, formData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedData = await postService.updatePost(id, formData);
            if (onSuccess) {
                onSuccess(updatedData);
            }
            return updatedData;
        } catch (err) {
            setError(err.message || 'Failed to update post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updatePost,
        loading,
        error
    };
};
