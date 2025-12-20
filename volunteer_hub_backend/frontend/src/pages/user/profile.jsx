"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/router";
import { toast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

export default function UserProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState({
    uid: "",
    name: "",
    email: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else getUser();
  }, [router]);

  const getUser = async () => {
    try {
      // Lấy userId từ localStorage hoặc từ token
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await userService.getUserById(userId);
      const fullName = response.data.name || "";

      setUser({
        uid: response.data.userId,
        name: fullName,
        email: response.data.email,
      });
      setEditForm({
        name: fullName,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Lỗi",
        description:
          "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      await userService.updateUserProfile(userId, {
        name: editForm.name.trim(),
      });

      toast({
        title: "Thành công",
        description: "Thông tin của bạn đã được cập nhật",
      });
      getUser();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Cập nhật thông tin thất bại",
        description:
          error.response?.data?.message ||
          "Đã có lỗi xảy ra khi kết nối với máy chủ",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      await userService.deleteUserAccount(userId);

      toast({
        title: "Thành công",
        description: "Tài khoản đã được xóa",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      router.push("/login");
    } catch (error) {
      toast({
        title: "Xóa tài khoản thất bại",
        description:
          error.response?.data?.message ||
          "Đã có lỗi xảy ra khi kết nối với máy chủ",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu được gõ lại không chính xác!",
        variant: "destructive",
      });
      return;
    }

    try {
      await userService.changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      router.push("/login");
    } catch (error) {
      toast({
        title: "Đổi mật khẩu thất bại",
        description:
          error.response?.data?.message ||
          "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <div className="container mx-auto pt-10 pl-64 space-y-6">
      <h1 className="text-2xl font-semibold">Hồ Sơ Cá Nhân</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>UID:</strong> {user.uid}
            </p>
            <p>
              <strong>Họ và Tên:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Chỉnh sửa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thông tin hồ sơ</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Họ và Tên</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Ví dụ: Nguyễn Văn Thắng"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit">Lưu thay đổi</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Gõ lại mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit">Lưu thay đổi</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Xóa tài khoản</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Bạn có chắc chắn muốn xóa tài khoản?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Sẽ không thể khôi phục tài khoản một khi đã được xóa. Tất cả
                  những dữ liệu liên quan tới tài khoản của bạn đều sẽ không
                  được lưu lại.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Thoát</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount}>
                  Xóa tài khoản
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleLogout} variant="outline" className="ml-4">
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
