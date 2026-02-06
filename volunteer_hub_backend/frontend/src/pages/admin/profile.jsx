'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useRouter } from 'next/router'
import { toast } from '@/hooks/use-toast'
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function AdminProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [admin, setAdmin] = useState({
    uid: '',
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: ''
  })
  const [editForm, setEditForm] = useState({ ...admin })
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin')
    }
    else getAdmin()

  }, [router])

  const getAdmin = async () => {
    const getAdminApi = `${API_BASE_URL}/api/users`

    try {
      const response = await axios.get(
          getAdminApi,
          {
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("token")
            },
          },
      );

      const res = response.data;
      const userData = res.data || res;
      
      // Parse name into firstName and lastName
      const fullName = userData.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setAdmin({ 
        "uid": userData.userId || userData.id, 
        "firstName": firstName, 
        "lastName": lastName, 
        "email": userData.email,
        "avatarUrl": userData.avatarUrl || ''
      })
      setEditForm({ 
        "uid": userData.userId || userData.id, 
        "firstName": firstName, 
        "lastName": lastName, 
        "email": userData.email,
        "avatarUrl": userData.avatarUrl || ''
      })
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại";
      toast({
        title: "Lỗi",
        description: errorMsg,
        variant: "destructive"
      })
    }
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    const updateAdminApi = `${API_BASE_URL}/api/users/profile`

    try {
      // Upload avatar if a new file was selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        
        const token = localStorage.getItem('token');
        const avatarResponse = await axios.post(
            `${API_BASE_URL}/api/upload/avatar`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
            }
        );
        
        if (avatarResponse.data?.data?.avatarUrl) {
          editForm.avatarUrl = avatarResponse.data.data.avatarUrl;
        }
      }

      // Combine firstName and lastName into name for the API
      const updateData = {
        name: `${editForm.firstName} ${editForm.lastName}`.trim(),
        avatarUrl: editForm.avatarUrl
      };

      await axios.put(
          updateAdminApi,
          updateData,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("token")
            },
          },
      );
      toast({
        title: "Thành công",
        description: "Thông tin của bạn đã được cập nhật",
      })
      setAvatarFile(null);
      setAvatarPreview(null);
      getAdmin()
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại";
      toast({
        title: "Cập nhật thông tin thất bại",
        description: errorMsg,
        variant: "destructive"
      })
    }
  }

  const handleDeleteAccount = async () => {
    const deleteAdminApi = `${API_BASE_URL}/api/users/me`

    try {
      await axios.delete(
          deleteAdminApi,
          {
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("token")
            },
          },
      );
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại";
      toast({
        title: "Xóa tài khoản thất bại",
        description: errorMsg,
        variant: "destructive"
      })
    }

    localStorage.removeItem('token')
    router.push('/admin')
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    const changePasswordApi = `${API_BASE_URL}/api/auth/change-password`

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu được gõ lại không chính xác!",
        variant: "destructive"
      })
      return
    }

    try {
      await axios.post(
          changePasswordApi,
          {
            "currentPassword": oldPassword,
            "newPassword": newPassword,
            "confirmPassword": confirmPassword,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("token")
            },
          },
      );
      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại",
      })
      router.push("/admin")
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại";
      toast({
        title: "Đổi mật khẩu thất bại",
        description: errorMsg,
        variant: "destructive"
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push("/admin")
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ảnh trước khi lưu",
        variant: "destructive"
      });
      return;
    }

    setSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      
      const token = localStorage.getItem('token');
      const avatarResponse = await axios.post(
        `${API_BASE_URL}/api/upload/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (avatarResponse.data?.data?.avatarUrl) {
        setAdmin(prev => ({ ...prev, avatarUrl: avatarResponse.data.data.avatarUrl }));
        setEditForm(prev => ({ ...prev, avatarUrl: avatarResponse.data.data.avatarUrl }));
      }
      
      toast({
        title: "Thành công",
        description: "Ảnh đại diện đã được cập nhật",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      getAdmin();
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh đại diện. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setSavingAvatar(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (admin.avatarUrl) {
      return admin.avatarUrl.startsWith('http') 
        ? admin.avatarUrl 
        : `${API_BASE_URL}${admin.avatarUrl}`;
    }
    return 'https://cdn.shadcnstudio.com/ss-assets/components/avatar/avatar-1.png';
  };

  return (
    <div className="container mx-auto pt-10 pl-64 pr-64 space-y-6">
      <h1 className="text-2xl font-semibold">Hồ Sơ Cá Nhân</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <img 
                src={getAvatarUrl()} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden" 
              />
              <div className="flex gap-2">
                <Button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Chọn ảnh
                </Button>
                {avatarFile && (
                  <Button 
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar}
                  >
                    {savingAvatar ? 'Đang lưu...' : 'Lưu ảnh'}
                  </Button>
                )}
              </div>
              {avatarFile && (
                <p className="text-sm text-gray-500 mt-2">
                  Đã chọn: {avatarFile.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>UID:</strong> {admin.uid}</p>
            <p><strong>Tên:</strong> {admin.firstName}</p>
            <p><strong>Họ:</strong> {admin.lastName}</p>
            <p><strong>Email:</strong> {admin.email}</p>
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
              <form onSubmit={handleUpdateAdmin}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">Tên</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Họ</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
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
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sẽ không thể khôi phục tài khoản một khi đã được xóa. Tất cả những dữ liệu liên quan tới tài khoản của bạn đều sẽ không được lưu lại.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Thoát</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount}>Xóa tài khoản</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleLogout} variant="outline" className="ml-4">Đăng xuất</Button>
        </CardContent>
      </Card>
    </div>
  )
}

