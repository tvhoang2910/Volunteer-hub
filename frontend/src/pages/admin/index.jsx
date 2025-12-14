import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/router";
import { useLogin } from "@/hooks/useLoginForm";

const AdminLogin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSuccess = (role) => {
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "MANAGER") {
      router.push("/manager/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  const { formData, loading, errorMessage, handleInputChange, handleSubmit } =
    useLogin(handleLoginSuccess, "ADMIN");

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/clouds-background.jpg')" }}
    >
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-green-500">
            Đăng nhập Admin
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <p className="text-red-600 text-center">{errorMessage}</p>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  handleInputChange({ target: { name: "role", value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
