import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useResetPassword } from "@/hooks/useResetPassword";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { form, loading, message, handleChange, setForm, handleSubmit } =
    useResetPassword(() => {
      router.push("/login");
    });

  // Prefill token from query string
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token") || "";
      if (token) setForm((p) => ({ ...p, token }));
    } catch (e) {
      // ignore
    }
  }, [setForm]);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/clouds-background.jpg')" }}
    >
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-green-500">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-center">
            Nhập token và mật khẩu mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <p className="text-center text-sm text-gray-700">{message}</p>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="token"
                className="text-sm font-medium text-gray-700"
              >
                Token
              </Label>
              <Input
                id="token"
                name="token"
                value={form.token}
                onChange={handleChange}
                placeholder="Token from email"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu mới
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-[#d55643] text-white"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="link" onClick={() => router.push("/login")}>
            Quay lại đăng nhập
          </Button>
          <Button variant="link" onClick={() => router.push("/signup")}>
            Đăng ký
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
