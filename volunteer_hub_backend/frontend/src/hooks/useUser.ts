import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function useUser() {
    const { isAuthenticated, userId } = useAuth();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Nếu có userId từ context, dùng luôn thay vì gọi API
        if (userId) {
            setUser({ id: userId });
        } else if (isAuthenticated) {
            fetchUser();
        }
    }, [isAuthenticated, userId]);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("No token found in localStorage");
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // API trả về { data: { id, roles, ... } }
            setUser(response.data?.data || response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
            // Fallback: dùng userId từ localStorage nếu API fail
            const storedUserId = localStorage.getItem("userId");
            if (storedUserId) {
                setUser({ id: storedUserId });
            }
        }
    };

    return user;
}