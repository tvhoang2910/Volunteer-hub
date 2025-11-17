import { useState } from 'react';

export function useAsyncFn(asyncFn) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await asyncFn(...args);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading, error };
}