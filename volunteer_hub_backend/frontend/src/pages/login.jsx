import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";

import { useLogin } from "@/hooks/useLoginForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Login bằng BE (email/password) - điều hướng theo role từ backend
  const handleLoginSuccess = (role) => {
    if (role === "ADMIN") {
      router.push("/admin/overview");
    } else if (role === "MANAGER") {
      router.push("/manager/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  const {
    formData,
    loading,
    errorMessage,
    handleInputChange,
    handleSubmit,
  } = useLogin(handleLoginSuccess); // Không truyền expectedRole để cho phép mọi role

  // Google Login via backend OAuth2
  const handleGoogleLogin = () => {
    const base = API_BASE_URL.replace(/\/$/, "");
    const authUrl = `${base}/oauth2/authorization/google`;
    window.location.href = authUrl;
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center pt-32 pb-24 overflow-hidden"
      style={{ backgroundImage: "url('/clouds-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white/20 to-blue-50/30" />

      <div className="relative w-full max-w-md mx-4 animate-fadeIn">
        <div className="absolute inset-0 bg-gradient-to-r from-green-200/40 to-blue-200/40 rounded-2xl blur-xl opacity-60" />

        <div className="relative backdrop-blur-xl bg-white/80 border border-white/60 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative p-8">
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Chào mừng trở lại
              </h1>
              <p className="text-gray-600 text-sm">
                Nhập thông tin đăng nhập để truy cập tài khoản
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-center text-sm">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="my-6 text-center text-sm text-gray-500">hoặc</div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 border rounded-xl flex justify-center gap-2"
            >
              Đăng nhập với Google
            </button>

            <p className="mt-6 text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/signup" className="text-green-600 font-semibold">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

