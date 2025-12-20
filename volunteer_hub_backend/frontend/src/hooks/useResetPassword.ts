import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const useResetPassword = (onSuccess) => {
  const [form, setForm] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    setLoading(true);
    setMessage("");

    if (form.password !== form.confirmPassword) {
      const msg = "Mật khẩu và xác nhận mật khẩu không khớp.";
      setMessage(msg);
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      // const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     token: form.token,
      //     password: form.password,
      //     confirmPassword: form.confirmPassword,
      //   }),
      // });
      const res = await axios.post(
          `${API_BASE_URL}/api/auth/reset-password`,
          {
            token: form.token,
            password: form.password,
            confirmPassword: form.confirmPassword,
          },
          {
            headers: { "Content-Type": "application/json" },
          },
      );

      // Axios response structure: res.data contains the response body
      const data = res.data || {};
      const serverMessage = data?.message || data?.data || null;

      // Axios doesn't have res.ok, check status code instead
      if (res.status < 200 || res.status >= 300) {
        const err = serverMessage || "Không thể đặt lại mật khẩu.";
        setMessage(err);
        toast({ title: "Lỗi", description: err, variant: "destructive" });
        return;
      }

      const successMsg =
        serverMessage || "Mật khẩu đã được cập nhật thành công.";
      setMessage(successMsg);
      toast({ title: "Hoàn tất", description: successMsg });
      onSuccess && onSuccess();
    } catch (err) {
      console.error("reset-password error:", err);
      const errMsg = "Không thể kết nối tới server. Vui lòng thử lại sau.";
      setMessage(errMsg);
      toast({
        title: "Lỗi hệ thống",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, message, handleChange, setForm, handleSubmit };
};
