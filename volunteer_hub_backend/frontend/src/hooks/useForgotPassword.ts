import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const useForgotPassword = (onSuccess) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`,
          {
            email,
          },
          {
            headers: { "Content-Type": "application/json" },
          },
      );

      // Axios trả về data trực tiếp qua res.data (không cần res.json())
      const data = res.data || {};
      const serverMessage = data?.message || data?.data || null;

      // Axios throw error cho non-2xx, nên nếu đến đây là thành công
      const successMsg =
        serverMessage ||
        "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn khôi phục.";
      setMessage(successMsg);
      toast({ title: "Hoàn tất", description: successMsg });
      onSuccess && onSuccess();
    } catch (err) {
      console.error("forgot-password error:", err);
      const backendMsg = err.response?.data?.message || err.response?.data?.detail;
      const errMsg = backendMsg || err.message || "Không thể kết nối tới server. Vui lòng thử lại sau.";
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

  return { email, loading, message, handleChange, handleSubmit };
};
