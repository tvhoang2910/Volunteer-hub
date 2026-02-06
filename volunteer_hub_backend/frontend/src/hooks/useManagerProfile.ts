import { useState, useEffect } from "react";
import managerService from "@/services/managerService";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export function useManagerProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        let mounted = true;
        managerService.getProfile().then((response) => {
            if (!mounted) return;
            // API returns { data: { userId, name, email, ... }, message: "..." }
            const userData = response?.data || response;
            setUser(userData);
            setLoading(false);
        });
        return () => (mounted = false);
    }, []);

    const handleSave = async (data) => {
        try {
            setAlert({ type: "success", message: "Đang lưu..." });
            
            // Upload avatar if a new file was selected
            if (data.avatarFile) {
                const formData = new FormData();
                formData.append('file', data.avatarFile);
                
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${API_BASE_URL}/api/upload/avatar`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                
                if (response.data?.data?.avatarUrl) {
                    data.avatarUrl = response.data.data.avatarUrl;
                }
            }
            
            const response = await managerService.updateProfile(data);
            // API returns { data: { userId, name, email, ... }, message: "..." }
            const updatedUser = response?.data || response;
            setUser(updatedUser);
            setAlert({ type: "success", message: "Cập nhật hồ sơ thành công." });
        } catch (err) {
            setAlert({ type: "error", message: err.message || "Lỗi khi lưu." });
            throw err;
        }
    };

    const closeAlert = () => setAlert(null);

    return { user, loading, alert, handleSave, closeAlert };
}
