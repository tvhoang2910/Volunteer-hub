import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";

import { useSignup } from "@/hooks/useSignupForm";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    formData,
    loading,
    passwordErrors,
    handleInputChange,
    handleSubmit,
  } = useSignup(() => router.push("/login"));

  // Google signup / login via backend OAuth2
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
                Tạo tài khoản
              </h1>
              <p className="text-gray-600 text-sm">
                Nhập thông tin để đăng ký tài khoản mới
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  placeholder="Tên"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input"
                />
                <input
                  name="lastName"
                  placeholder="Họ"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              {/* Email */}
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input"
              />

              {/* Password */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-btn"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
                {/* Password Validation Errors */}
                {passwordErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordErrors.map((error, idx) => (
                      <p key={idx} className="text-red-600 text-sm">
                        • {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="eye-btn"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Role */}
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="input"
              >
                <option value="VOLUNTEER">Tình nguyện viên</option>
                <option value="MANAGER">Quản lý</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>

            <div className="my-6 text-center text-sm text-gray-500">hoặc</div>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 border rounded-xl"
            >
              Đăng nhập với Google
            </button>

            <p className="mt-6 text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/login" className="text-green-600 font-semibold">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }
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

