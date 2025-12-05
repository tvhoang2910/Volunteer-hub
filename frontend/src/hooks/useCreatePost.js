import { useState } from 'react';
import { postService } from '../services/postService';

export const useCreatePost = (onSuccess) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createPost = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const newPost = await postService.createPost(formData);
            if (onSuccess) {
                onSuccess(newPost);
            }
            return newPost;
        } catch (err) {
            setError(err.message || 'Failed to create post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        createPost,
        loading,
        error
    };
};
