import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function useUser() {
    const { isAuthenticated } = useAuth();
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUser();
        }
    }, [isAuthenticated]);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    return user;
}