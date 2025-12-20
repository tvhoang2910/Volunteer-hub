import { useAsyncFn } from './useAsync';
import { postService } from '../services/postService';

export const useDeletePost = (onSuccess) => {
    const { execute, loading, error } = useAsyncFn(postService.deletePost);

    const deletePost = async (id) => {
        await execute(id);
        if (onSuccess) {
            onSuccess(id);
        }
    };

    return {
        deletePost,
        loading,
        error
    };
};
