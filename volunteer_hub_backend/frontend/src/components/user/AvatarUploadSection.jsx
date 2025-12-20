"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { toast } from '@/hooks/use-toast';

// Generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate a color based on name hash
const getAvatarColor = (name) => {
  if (!name) return 'from-green-500 to-emerald-600';
  const colors = [
    'from-green-500 to-emerald-600',
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-blue-600',
    'from-rose-500 to-pink-600',
  ];
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[hash % colors.length];
};

// Convert relative avatar path to full backend URL
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath; // Already full URL
  // Convert relative path to full backend URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return `${apiBaseUrl}${avatarPath}`;
};

export default function AvatarUploadSection({ isCollapsed = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found');
          return;
        }
        
        const response = await userService.getUserById(userId);
        if (response.data) {
          setUser(response.data);
          setImageError(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn một file ảnh hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await userService.uploadAvatar(formData);
      
      if (response.data?.avatarUrl) {
        // Update local user state
        setUser(prev => ({
          ...prev,
          avatarUrl: response.data.avatarUrl,
        }));
        setImageError(false);

        toast({
          title: 'Thành công',
          description: 'Avatar của bạn đã được cập nhật',
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể upload avatar, vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const avatarUrl = user?.avatarUrl;
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);

  if (loading) {
    return (
      <div className={`border-b border-zinc-800/50 ${isCollapsed ? 'p-3' : 'p-4'} flex justify-center`}>
        <div className="w-12 h-12 bg-zinc-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`border-b border-zinc-800/50 ${isCollapsed ? 'p-3' : 'p-4'}`}>
      <div className="flex flex-col items-center gap-3">
        {/* Avatar with Upload Button */}
        <div className="relative group">
          <div className={`relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-zinc-700 flex items-center justify-center ${
            !avatarUrl || imageError ? `bg-gradient-to-br ${avatarColor}` : 'bg-zinc-700'
          }`}>
            {avatarUrl && !imageError ? (
              <Image
                src={getFullAvatarUrl(avatarUrl)}
                alt={userName}
                fill
                className="object-cover"
                onError={handleImageError}
                unoptimized
              />
            ) : (
              <span className="text-lg font-bold text-white">{initials}</span>
            )}
          </div>
          
          {/* Upload Overlay */}
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Click to upload avatar"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* User Info - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="text-center flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
          </div>
        )}
      </div>
    </div>
  );
}
