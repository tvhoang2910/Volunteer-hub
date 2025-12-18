import { GROUP_SERVICE } from "@/services/groupService";
import { useEffect, useState } from "react";

export const useGroup = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await GROUP_SERVICE.getAllGroups();
                setGroups(response.groups);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    return { groups, loading, error };
}