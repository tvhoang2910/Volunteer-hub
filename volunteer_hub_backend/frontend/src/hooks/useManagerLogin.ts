import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "@/hooks/useForm";

import managerService from "@/services/managerService";

export function useManagerLogin() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { formData, handleInputChange } = useForm({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await managerService.login(formData.email, formData.password);
            localStorage.setItem("token", data.token);
            router.push("/manager/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        showPassword,
        setShowPassword,
        formData,
        handleInputChange,
        handleSubmit,
        loading,
        error
    };
}
