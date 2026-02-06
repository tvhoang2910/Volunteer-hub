import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import managerService from "@/services/managerService";

export function useManagerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalMembers: 0,
        totalPosts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const data = await managerService.getDashboardStats();
                setStats(data.summary);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    return { stats, loading };
}
