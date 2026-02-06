import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "@/hooks/useForm";
import { authService } from "@/services/authService";

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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

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

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: fullName,
        role: formData.role,
      });

      // Đăng ký thành công (status 200)
      let successMessage = 'Tài khoản đã được tạo thành công.';
      if (formData.role === 'ADMIN') {
        successMessage = 'Yêu cầu đăng ký ADMIN đã được gửi. Vui lòng chờ admin duyệt trước khi đăng nhập với quyền Admin.';
      }
      toast({
        title: "Đăng ký thành công!",
        description: successMessage,
      });
      onSuccess && onSuccess();
    } catch (error: any) {
      console.error("Lỗi khi đăng ký:", error);

      // Lấy message lỗi từ server response (nếu có)
      const responseData = error?.response?.data;
      let errorTitle = "Lỗi đăng ký";
      let errorMessage = "Không thể tạo tài khoản. Vui lòng thử lại.";

      // Kiểm tra nếu có mảng validation errors trong data
      if (Array.isArray(responseData?.data) && responseData.data.length > 0) {
        // Hiển thị từng lỗi validation với bullet points
        errorTitle = "Lỗi xác thực dữ liệu";
        errorMessage = responseData.data.map((err: string) => `• ${err}`).join('\n');
      } else if (responseData?.detail) {
        errorMessage = responseData.detail;
      } else if (responseData?.message && responseData.message !== "Validation failed") {
        errorMessage = responseData.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        style: { whiteSpace: 'pre-line' }, // Cho phép xuống dòng
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    passwordErrors,
    handleInputChange,
    handleSubmit,
    setFieldValue,
  };
};
