import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "@/hooks/useForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const useSignup = (onSuccess, initialRole = "VOLUNTEER") => {
  const { formData, handleInputChange, setFieldValue } = useForm({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole, // ⚠️ UPPERCASE cho BE
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi đăng ký",
        description: "Mật khẩu và xác nhận mật khẩu không khớp.",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "ADMIN") {
      toast({
        title: "Lỗi đăng ký",
        description: "Không thể tự đăng ký vai trò ADMIN.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          name: fullName,
          role: formData.role,
        }),
      });

      if (response.ok) {
        await response.json();
        toast({
          title: "Đăng ký thành công!",
          description: "Tài khoản đã được tạo thành công.",
        });
        onSuccess && onSuccess();
      } else {
        const errorData = await response.json();
        toast({
          title: "Lỗi đăng ký",
          description: errorData?.message || "Không thể tạo tài khoản.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Không thể kết nối đến máy chủ.",
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
