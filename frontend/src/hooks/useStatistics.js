
import { useState, useEffect, useCallback } from 'react';
import { statisticService } from '@/services/statisticService';
import { toast } from '@/hooks/use-toast';

export const useStatistics = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const stats = await statisticService.getAdminDashboardStats();
            setData(stats);
        } catch (err) {
            console.error(err);
            setError(err);
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    return {
        data,
        isLoading,
        error,
        refreshStatistics: fetchStatistics
    };
};
