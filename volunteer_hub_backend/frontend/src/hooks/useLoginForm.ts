import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "@/hooks/useForm";

import { authService } from "@/services/authService";

export const useLogin = (onSuccess, initialRole = "VOLUNTEER") => {
  const { login } = useAuth();

  // Dùng useForm của Hoanghai nhưng giữ role UPPERCASE cho BE
  const { formData, handleInputChange, setFieldValue } = useForm({
    email: "",
    password: "",
    role: initialRole,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      const response = await authService.login(formData);

      const serverMessage =
        response.data?.message ||
        (Array.isArray(response.data?.data)
          ? response.data.data.join("; ")
          : response.data?.data?.message) ||
        null;

      if (!response.status === 200) {
        const message =
          serverMessage ||
          "Đăng nhập thất bại. Kiểm tra email / mật khẩu / vai trò.";
        toast({
          title: "Lỗi đăng nhập",
          description: message,
          variant: "destructive",
        });
        return;
      }

      // BE-compatible token resolve
      const token =
        response?.data?.accessToken ||
        response?.accessToken ||
        response?.data?.token ||
        response?.token;

      if (!token) {
        toast({
          title: "Lỗi đăng nhập",
          description: "Không nhận được token từ server.",
          variant: "destructive",
        });
        return;
      }

      const resolvedRole = response?.data?.role || response?.role || formData.role;
      const userId = response?.data?.userId || response?.userId || null;

      // Quan trọng: login(token, role)
      login(token, resolvedRole, userId);

      toast({
        title: serverMessage || "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      onSuccess && onSuccess(resolvedRole, response);
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Không thể kết nối đến server.",
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
    setFieldValue,
  };
};
