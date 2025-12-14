import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "@/hooks/useForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      const serverMessage =
        data?.message ||
        (Array.isArray(data?.data)
          ? data.data.join("; ")
          : data?.data?.message) ||
        null;

      if (!response.ok) {
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
        data?.data?.accessToken ||
        data?.accessToken ||
        data?.data?.token ||
        data?.token;

      if (!token) {
        toast({
          title: "Lỗi đăng nhập",
          description: "Không nhận được token từ server.",
          variant: "destructive",
        });
        return;
      }

      const resolvedRole = data?.data?.role || data?.role || formData.role;

      // Quan trọng: login(token, role)
      login(token, resolvedRole);

      toast({
        title: serverMessage || "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      onSuccess && onSuccess(resolvedRole, data);
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
