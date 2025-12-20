"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    X,
    ChevronDown,
    Image as ImageIcon,
    Users,
    Smile,
    MapPin,
    MessageCircle,
    MoreHorizontal,
} from "lucide-react";
import "quill/dist/quill.snow.css";
import { postService } from "@/services/postService";
import { toast } from "@/hooks/use-toast";
import useUserProfile from "@/hooks/useUserProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Dynamic import ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Helper to get full avatar URL
const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_BASE_URL}${avatarPath}`;
};

// Main Component (The Modal Form)
const CreatePostForm = ({ onClose, onSuccess, user, eventId }) => {
    const [postContent, setPostContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imageUploading, setImageUploading] = useState(false);

    const modules = {
        toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "code-block"],
            ["clean"],
        ],
    };

    const formats = [
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "link",
        "code-block",
    ];

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // Max 5MB
        );
        
        if (validFiles.length !== files.length) {
            toast({
                title: "Cảnh báo",
                description: "Một số file không hợp lệ (chỉ chấp nhận ảnh, dung lượng tối đa 5MB)",
                variant: "warning",
            });
        }
        
        // Create preview URLs
        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9)
        }));
        
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    };

    const removeImage = (id) => {
        setSelectedImages(prev => {
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return prev.filter(img => img.id !== id);
        });
    };

    const handleSubmit = async () => {
        if (!postContent.trim()) return;

        if (!eventId) {
            toast({
                title: "Lỗi",
                description: "Không xác định được sự kiện. Vui lòng thử lại.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const postData = {
                eventId: eventId,
                content: postContent,
                imageUrls: []
            };
            
            // Create the post first
            let newPost = await postService.createPost(postData);
            const postId = newPost.postId || newPost.id;
            
            // Upload images if any
            if (selectedImages.length > 0) {
                setImageUploading(true);
                const uploadedImageUrls = [];
                
                for (const img of selectedImages) {
                    try {
                        const result = await postService.uploadPostImage(postId, img.file);
                        if (result?.imageUrl) {
                            uploadedImageUrls.push(result.imageUrl);
                        }
                    } catch (uploadError) {
                        console.error("Failed to upload image:", uploadError);
                    }
                }
                setImageUploading(false);
                
                // Update newPost with uploaded image URLs for UI display
                newPost = {
                    ...newPost,
                    imageUrls: uploadedImageUrls,
                    media: uploadedImageUrls.map(url => ({ type: 'image', url }))
                };
            }
            
            // Clean up preview URLs
            selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
            
            setPostContent("");
            setSelectedImages([]);
            toast({
                title: "Thành công",
                description: "Bài viết đã được tạo thành công.",
            });
            if (onSuccess) onSuccess(newPost);
            if (onClose) onClose();
        } catch (error) {
            console.error("Failed to create post", error);
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể tạo bài viết. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setImageUploading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-center px-4 py-4 border-b border-gray-200 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Tạo bài viết</h2>
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img
                            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=HaiHoang"}
                            alt={user?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-semibold text-[15px]">{user?.name || "User"}</h3>

                    </div>
                </div>

                {/* Editor */}
                <div className="min-h-[150px]">
                    <ReactQuill
                        theme="snow"
                        value={postContent}
                        onChange={setPostContent}
                        modules={modules}
                        formats={formats}
                        placeholder="What's on your mind?"
                        className="bg-transparent border-none [&_.ql-editor]:p-0 [&_.ql-editor]:text-lg [&_.ql-editor]:min-h-[150px] [&_.ql-container.ql-snow]:border-none"
                    />
                </div>

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedImages.map((img) => (
                            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={img.preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Footer Section */}
            <div className="px-4 pb-4 shrink-0">
                {/* Image Upload Button */}
                <div className="flex items-center gap-3 mb-3 p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600 flex-grow">Thêm vào bài viết của bạn</span>
                    <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={selectedImages.length >= 5}
                        />
                        <ImageIcon size={24} className={`${selectedImages.length >= 5 ? 'text-gray-300' : 'text-green-500'}`} />
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={!postContent.trim() || postContent === "<p><br></p>" || loading || imageUploading}
                >
                    {loading ? (imageUploading ? "Đang tải ảnh..." : "Đang đăng...") : "Đăng bài"}
                </button>
            </div>
        </div>
    );
};

// Trigger Component (The Box on the Feed)
const CreatePostInput = ({ onPostCreated, eventId }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Get real user data from hook
    const { user: profileUser, loading: userLoading } = useUserProfile();
    
    // Build user object with proper avatar URL
    const user = {
        name: profileUser?.name || "Bạn",
        avatar: getFullAvatarUrl(profileUser?.avatarUrl) || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(profileUser?.name || 'User')}`
    };

    const handlePostBar = () => {
        setIsOpen(true);
    };

    const closePostBar = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div className="flex flex-col rounded-lg bg-white p-3 px-4 shadow dark:bg-neutral-800 mb-4">
                <div className="mb-2 flex items-center space-x-2 border-b pb-3 dark:border-neutral-700">
                    <div className="h-10 w-10">
                        <img src={user.avatar} className="h-full w-full rounded-full object-cover" alt="avatar" />
                    </div>
                    <button
                        className="h-10 flex-grow rounded-full bg-gray-100 pl-5 text-left text-gray-500 hover:bg-gray-200 focus:bg-gray-300 focus:outline-none dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700"
                        onClick={handlePostBar}
                    >
                        <div>
                            What&apos;s on your mind, {user.name}?
                        </div>
                    </button>
                </div>


            </div>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity"
                        onClick={closePostBar}
                        aria-hidden="true"
                    />

                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                        <CreatePostForm
                            onClose={closePostBar}
                            onSuccess={(newPost) => {
                                if (onPostCreated) onPostCreated(newPost);
                                closePostBar();
                            }}
                            user={user}
                            eventId={eventId}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default CreatePostInput;
