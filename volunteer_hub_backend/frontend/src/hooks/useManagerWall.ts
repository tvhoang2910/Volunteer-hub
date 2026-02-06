import { useState, useEffect, useMemo } from "react";
import managerService from "@/services/managerService";

export function useManagerWall() {
    const [groups, setGroups] = useState([]);
    const [posts, setPosts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await managerService.getWallData();
                setGroups(data.groups);
                setPosts(data.posts);
                setNotifications(data.notifications);
            } catch (error) {
                console.error("Failed to fetch wall data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const topGroups = useMemo(
        () => groups.map((g) => ({ ...g, activityCount: g.activityCount })),
        [groups]
    );

    return {
        groups,
        posts,
        notifications,
        selectedGroupId,
        setSelectedGroupId,
        topGroups,
        loading,
    };
}
