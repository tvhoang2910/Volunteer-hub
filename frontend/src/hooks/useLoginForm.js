import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const useLogin = (onSuccess) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (!API_BASE_URL) {
        const message =
          "Chua thiet lap NEXT_PUBLIC_API_BASE_URL, khong the goi API dang nhap.";
        setErrorMessage(message);
        toast({
          title: "Thieu cau hinh",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      // Các thông điệp server có thể nằm ở `message` hoặc `data` theo ResponseDTO
      const serverMessage =
        data?.message ||
        (Array.isArray(data?.data)
          ? data.data.join("; ")
          : data?.data?.message) ||
        null;

      if (!response.ok) {
        const message =
          serverMessage || "Đăng nhập thất bại. Kiểm tra email/mật khẩu.";
        setErrorMessage(message);
        toast({
          title: "Lỗi đăng nhập",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const token = data?.data?.token || data?.token;
      if (!token) {
        const message = serverMessage || "Không nhận được token từ server.";
        setErrorMessage(message);
        toast({
          title: "Lỗi đăng nhập",
          description: message,
          variant: "destructive",
        });
        return;
      }

      login(token);
      toast({
        title: serverMessage || "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại.",
      });
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Login error:", error);
      const message =
        "Khong the ket noi server. Kiem tra backend hoac NEXT_PUBLIC_API_BASE_URL.";
      setErrorMessage(message);
      toast({
        title: "Loi he thong",
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
    errorMessage,
    handleInputChange,
    handleSubmit,
  };
};
