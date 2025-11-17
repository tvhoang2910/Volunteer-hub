"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";

// Dynamic import ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Toolbar Component
const PostToolbar = () => {
    return (
        <div className="px-4 pb-4">
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                <span className="text-white font-medium">Add to your post</span>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-800 rounded-full transition" title="Photo/Video">
                        <ImageIcon size={24} className="text-green-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full transition" title="Tag people">
                        <Users size={24} className="text-blue-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full transition" title="Feeling/Activity">
                        <Smile size={24} className="text-yellow-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full transition" title="Check in">
                        <MapPin size={24} className="text-red-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full transition" title="WhatsApp">
                        <MessageCircle size={24} className="text-green-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full transition" title="More">
                        <MoreHorizontal size={24} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const CreatePostForm = () => {
    const [postContent, setPostContent] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const closePostBar = () => {
        setIsOpen(false);
    };
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

    const handleSubmit = () => {
        console.log("Nội dung bài đăng:", postContent);
        alert("Nội dung bài đăng:\n" + postContent);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-black text-center w-full">Create post</h2>
                <button className="text-gray-400 hover:text-white transition" onClick={() => { closePostBar() }}>
                    <X size={24} />
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=HaiHoang"
                            alt="Hải Hoàng"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-black font-semibold">Hải Hoàng</h3>
                        <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 hover:bg-gray-600 transition">
                        </button>
                    </div>
                </div>

                <ReactQuill
                    theme="snow"
                    value={postContent}
                    onChange={setPostContent}
                    modules={modules}
                    formats={formats}
                    placeholder="Bạn đang nghĩ gì?"
                    className="bg-white text-black rounded-lg"
                />
            </div>

            {/* Toolbar as separate section */}
            {/* <PostToolbar /> */}

            <div className="px-4 pb-4">
                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!postContent.trim()}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default CreatePostForm;
