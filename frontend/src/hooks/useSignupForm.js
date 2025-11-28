import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const useSignup = (onSuccess) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      const message = "Mat khau va xac nhan khong khop.";
      setErrorMessage(message);
      toast({
        title: "Loi dang ky",
        description: message,
        variant: "destructive",
      });
      return;
    }

    if (!API_BASE_URL) {
      const message =
        "Chua thiet lap NEXT_PUBLIC_API_BASE_URL, khong the goi API dang ky.";
      setErrorMessage(message);
      toast({
        title: "Thieu cau hinh",
        description: message,
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
        }),
      });

      // Debug: log status for easier troubleshooting
      console.debug(
        "[signup] request sent to",
        `${API_BASE_URL}/api/auth/register`
      );
      console.debug("[signup] response status:", response.status);

      const data = await response.json().catch(() => ({}));
      // Debug: print response body when not OK to help identify server-side validation/errors/CORS
      if (!response.ok) {
        console.debug("[signup] response body:", data);
      }

      const serverMessage =
        data?.message ||
        (Array.isArray(data?.data)
          ? data.data.join("; ")
          : data?.data?.message) ||
        null;

      if (!response.ok) {
        const message =
          serverMessage || "Không thể tạo tài khoản. Vui lòng thử lại.";
        setErrorMessage(message);
        toast({
          title: "Lỗi đăng ký",
          description: message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: serverMessage || "Đăng ký thành công",
        description: "Tài khoản đã được tạo. Vui lòng đăng nhập.",
      });
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Signup error:", error);
      const message =
        "Không thể kết nối tới server. Kiểm tra backend hoặc NEXT_PUBLIC_API_BASE_URL.";
      setErrorMessage(message);
      toast({
        title: "Lỗi hệ thống",
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
