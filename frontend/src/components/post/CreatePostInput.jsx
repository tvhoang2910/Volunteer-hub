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
import "react-quill/dist/quill.snow.css";
import { useCreatePost } from "../../hooks/useCreatePost";

// Dynamic import ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Main Component (The Modal Form)
const CreatePostForm = ({ onClose, onSuccess, user }) => {
    const [postContent, setPostContent] = useState("");
    const { createPost, loading } = useCreatePost(onSuccess);

    const modules = {
        toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image", "code-block"],
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
        "image",
        "code-block",
    ];

    const handleSubmit = async () => {
        if (!postContent.trim()) return;

        const formData = new FormData();
        formData.append('content', postContent);
        // Note: ReactQuill handles images as base64 by default in the content. 
        // For file uploads, we'd need a custom handler, but for now we stick to the requested UI.

        try {
            await createPost(formData);
            setPostContent("");
            if (onClose) onClose();
        } catch (error) {
            console.error("Failed to create post", error);
            alert("Failed to create post");
        }
    };

    return (
        <div className="flex flex-col bg-white w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-center px-4 py-4 border-b border-gray-200 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Create post</h2>
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
                        <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-200 transition mt-0.5">
                            <Users size={12} />
                            <span>Friends</span>
                            <ChevronDown size={12} />
                        </button>
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

                {/* Background/Emoji picker placeholder */}
                <div className="flex justify-between items-center mt-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 cursor-pointer opacity-80 hover:opacity-100"></div>
                    <Smile size={24} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
            </div>

            {/* Footer Section */}
            <div className="px-4 pb-4 shrink-0">
                {/* Add to your post */}
                <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg mb-4 shadow-sm">
                    <span className="text-gray-900 font-semibold text-[15px]">Add to your post</span>
                    <div className="flex items-center gap-1">
                        <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="Photo/Video">
                            <ImageIcon size={24} className="text-green-500" />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="Tag people">
                            <Users size={24} className="text-blue-500" />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="Feeling/Activity">
                            <Smile size={24} className="text-yellow-500" />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="Check in">
                            <MapPin size={24} className="text-red-500" />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="More">
                            <MoreHorizontal size={24} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={!postContent.trim() || postContent === "<p><br></p>" || loading}
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
};

// Trigger Component (The Box on the Feed)
const CreatePostInput = ({ onPostCreated }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Mock user data - in real app this comes from context/auth
    const user = {
        name: "Bạn",
        avatar: "https://random.imagecdn.app/200/200"
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
                        What's on your mind, {user.name}?
                    </button>
                </div>

                <div className="-mb-1 flex space-x-3 text-sm font-thin">
                    <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                        <i className="fas fa-video text-red-600" />
                        <span className="font-semibold">Live Video</span>
                    </button>

                    <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                        <i className="fas fa-images text-green-600" />
                        <span className="font-semibold">Photo/Video</span>
                    </button>

                    <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                        <i className="far fa-smile text-yellow-600" />
                        <span className="font-semibold">Feeling/Activity</span>
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
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default CreatePostInput;
