import { useAsyncFn } from './useAsync';
import { postService } from '../services/postService';

export const useDeletePost = (onSuccess) => {
    const { execute, loading, error } = useAsyncFn(postService.deletePost);

    const deletePost = async (id) => {
        try {
            await execute(id);
            console.log('[useDeletePost] Delete successful, calling onSuccess with id:', id);
            if (onSuccess) {
                onSuccess(id);
            }
        } catch (err) {
            console.error('[useDeletePost] Delete failed:', err);
            throw err;
        }
    };

    return {
        deletePost,
        loading,
        error
    };
};
