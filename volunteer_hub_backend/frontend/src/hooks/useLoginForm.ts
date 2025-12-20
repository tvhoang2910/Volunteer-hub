import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "@/hooks/useForm";
import { authService } from "@/services/authService";

const normalizeRole = (role?: string | null) => {
  if (!role) return null;
  const r = String(role).trim();
  return r.startsWith("ROLE_") ? r.slice("ROLE_".length) : r;
};

const tryGetJwtPayload = (token: string): any | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

type UseLoginOptions = {
  expectedRole?: string;
};

export const useLogin = (
  onSuccess,
  initialRole = "VOLUNTEER",
  options: UseLoginOptions = {}
) => {
  const { login } = useAuth();

  const { formData, handleInputChange, setFieldValue } = useForm({
    email: "",
    password: "",
    role: initialRole,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await authService.login(formData);
      const serverMessage =
        response?.message ||
        (Array.isArray(response?.data)
          ? response.data.join("; ")
          : response?.data?.message) ||
        null;

      // BE-compatible token resolve
      const token =
        response?.data?.accessToken ||
        response?.accessToken ||
        response?.data?.token ||
        response?.token;

      if (!token) {
        const message =
          serverMessage ||
          "Đăng nhập thất bại. Không nhận được token từ server.";
        setErrorMessage(message);
        toast({
          title: "Lỗi đăng nhập",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const jwtPayload = tryGetJwtPayload(token);
      const resolvedRole = normalizeRole(
        response?.data?.role ||
          response?.role ||
          jwtPayload?.role ||
          formData.role
      );
      const userId =
        response?.data?.userId || response?.userId || jwtPayload?.sub || null;

      // Validate expectedRole nếu có
      if (options.expectedRole && resolvedRole !== options.expectedRole) {
        const message = `Tài khoản của bạn có vai trò ${resolvedRole}. Vui lòng đăng nhập đúng khu vực ${options.expectedRole}.`;
        setErrorMessage(message);
        toast({
          title: "Sai luồng đăng nhập",
          description: message,
          variant: "destructive",
        });
        return;
      }

      login(token, resolvedRole, userId);

      toast({
        title: serverMessage || "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      onSuccess && onSuccess(resolvedRole, response);
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      const message = "Không thể kết nối đến server.";
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
    setFieldValue,
  };
};
