import React from "react";
import Link from "next/link";
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
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { email, loading, message, handleChange, handleSubmit } =
    useForgotPassword(() => {
      // optional: redirect to login after success
      router.push("/login");
    });

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/clouds-background.jpg')" }}
    >
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-green-500">
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="text-center">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <p className="text-center text-sm text-gray-700">{message}</p>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-[#d55643] text-white"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/login">
            <Button variant="link">Quay lại đăng nhập</Button>
          </Link>
          <Link href="/signup">
            <Button variant="link">Đăng ký</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
