import { useAsyncFn } from './useAsync';
import { postService } from '../services/postService';

export const useToggleReaction = () => {
    const { execute, loading, error } = useAsyncFn(postService.toggleReaction);

    const toggleReaction = async (id) => {
        try {
            await execute(id);
            return true;
        } catch (err) {
            return false;
        }
    };

    return {
        toggleReaction,
        loading,
        error
    };
};
