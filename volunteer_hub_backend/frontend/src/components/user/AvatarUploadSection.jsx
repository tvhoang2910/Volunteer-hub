"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/userService';
import { toast } from '@/hooks/use-toast';
import useUserProfile from '@/hooks/useUserProfile';

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
  if (avatarPath.startsWith('blob:')) return avatarPath; // Preview blob URL
  // Convert relative path to full backend URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return `${apiBaseUrl}${avatarPath}`;
};

export default function AvatarUploadSection({ isCollapsed = false }) {
  // Use cached user profile hook instead of direct API call
  const { user, loading, updateAvatar } = useUserProfile();
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // Preview URL for selected file
  const [selectedFile, setSelectedFile] = useState(null); // Store selected file for upload
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
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

    // Create preview URL and store file for later upload
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setImageError(false);
  };

  // Cancel the selected file and go back to current avatar
  const handleCancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clean up blob URL
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Actually upload and save the avatar
  const handleSaveAvatar = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await userService.uploadAvatar(formData);
      
      if (response.data?.avatarUrl) {
        // Update avatar in cache and local state
        updateAvatar(response.data.avatarUrl);
        setImageError(false);

        toast({
          title: 'Thành công',
          description: 'Avatar của bạn đã được lưu',
        });
      }
      
      // Clear preview state
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể lưu avatar, vui lòng thử lại',
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

  // Use preview URL if available, otherwise current avatar
  const displayUrl = previewUrl || user?.avatarUrl;
  const avatarUrl = user?.avatarUrl;
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);
  const hasPreview = !!previewUrl; // Whether we're showing a preview

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
          <div className={`relative w-12 h-12 rounded-full overflow-hidden ring-2 ${hasPreview ? 'ring-green-500' : 'ring-zinc-700'} flex items-center justify-center ${
            !displayUrl || imageError ? `bg-gradient-to-br ${avatarColor}` : 'bg-zinc-700'
          }`}>
            {displayUrl && !imageError ? (
              <Image
                src={getFullAvatarUrl(displayUrl)}
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
          
          {/* Upload Overlay - only show when not in preview mode */}
          {!hasPreview && (
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Click để chọn ảnh"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
          )}

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

        {/* Save/Cancel buttons when preview is active */}
        {hasPreview && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelUpload}
              disabled={uploading}
              className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAvatar}
              disabled={uploading}
              className="h-7 px-2 bg-green-600 hover:bg-green-500 text-white"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Lưu ảnh
            </Button>
          </div>
        )}

        {/* User Info - Only show when not collapsed and not in preview mode */}
        {!isCollapsed && !hasPreview && (
          <div className="text-center flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
          </div>
        )}
        
        {/* Preview label */}
        {hasPreview && !isCollapsed && (
          <p className="text-xs text-green-400">Xem trước - Nhấn "Lưu ảnh" để cập nhật</p>
        )}
      </div>
    </div>
  );
}
