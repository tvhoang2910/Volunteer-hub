import { useAsyncFn } from './useAsync';
import { postService } from '../services/postService';

export const useCreatePost = (onSuccess) => {
    const { execute, loading, error } = useAsyncFn(postService.createPost);

    const createPost = async (formData) => {
        const result = await execute(formData);
        if (onSuccess) {
            onSuccess(result);
        }
        return result;
    };

    return {
        createPost,
        loading,
        error
    };
};
