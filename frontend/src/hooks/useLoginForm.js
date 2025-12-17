import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "@/hooks/useForm";
import { authService } from "@/services/authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useLogin = (onSuccess) => {
  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  const { formData, handleInputChange, setFieldValue } = useForm({ email: "", password: "", role: "volunteer" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(formData);

      if (data && data.token) {
        const { token } = data;
        login(token);
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn trở lại.",
        });
        if (onSuccess) onSuccess(data, formData);
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      const message = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";

      toast({
        title: "Lỗi đăng nhập",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    setFieldValue, // Expose setFieldValue
  };
};
