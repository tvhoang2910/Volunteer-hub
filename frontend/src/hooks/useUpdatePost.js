import { useAsyncFn } from './useAsync';
import { postService } from '../services/postService';

export const useUpdatePost = (onSuccess) => {
    const { execute, loading, error } = useAsyncFn(postService.updatePost);

    const updatePost = async (id, formData) => {
        const result = await execute(id, formData);
        if (onSuccess) {
            onSuccess(result);
        }
        return result;
    };

    return {
        updatePost,
        loading,
        error
    };
};
