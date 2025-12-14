import { useState, useEffect } from "react";
import managerService from "@/services/managerService";

export function useManagerProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        let mounted = true;
        managerService.getProfile().then((u) => {
            if (!mounted) return;
            setUser(u);
            setLoading(false);
        });
        return () => (mounted = false);
    }, []);

    const handleSave = async (data) => {
        try {
            setAlert({ type: "success", message: "Đang lưu..." });
            const updated = await managerService.updateProfile(data);
            setUser(updated);
            setAlert({ type: "success", message: "Cập nhật hồ sơ thành công." });
        } catch (err) {
            setAlert({ type: "error", message: err.message || "Lỗi khi lưu." });
            throw err;
        }
    };

    const closeAlert = () => setAlert(null);

    return { user, loading, alert, handleSave, closeAlert };
}
