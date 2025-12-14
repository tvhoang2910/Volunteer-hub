import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import managerService from "@/services/managerService";

export function useManagerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalMembers: 0,
        recentPosts: 0,
    });
    const [newEvents, setNewEvents] = useState([]);
    const [trending, setTrending] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/manager");
            return;
        }

        const fetchData = async () => {
            try {
                const data = await managerService.getDashboardStats();
                setStats(data.summary);
                setNewEvents(data.newEvents);
                setTrending(data.trending);
                setMonthlyStats(data.monthlyStats);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    return { stats, newEvents, trending, monthlyStats, loading };
}
