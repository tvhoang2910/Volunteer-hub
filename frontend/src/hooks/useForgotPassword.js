import { useState } from "react";
import { toast } from "@/hooks/use-toast";

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
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      const serverMessage = data?.message || data?.data || null;

      if (!res.ok) {
        const err = serverMessage || "Yêu cầu khôi phục mật khẩu thất bại.";
        setMessage(err);
        toast({ title: "Lỗi", description: err, variant: "destructive" });
        return;
      }

      const successMsg =
        serverMessage ||
        "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn khôi phục.";
      setMessage(successMsg);
      toast({ title: "Hoàn tất", description: successMsg });
      onSuccess && onSuccess();
    } catch (err) {
      console.error("forgot-password error:", err);
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

  return { email, loading, message, handleChange, handleSubmit };
};
