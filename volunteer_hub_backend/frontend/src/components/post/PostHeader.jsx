import React, { useState } from 'react';

const PostHeader = ({ user, createdAt, onEdit, onDelete, isOwner }) => {
    const [showOptions, setShowOptions] = useState(false);

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                    <h3 className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">
                        {user.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-1">
                        <span>{timeAgo(createdAt)}</span>
                        <span>•</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM8 2a1 1 0 00-1 1v4H3a1 1 0 000 2h5a1 1 0 001-1V3a1 1 0 00-1-1z" />
                        </svg>
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>

                    {showOptions && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowOptions(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 py-1">
                                <button
                                    onClick={() => {
                                        onEdit();
                                        setShowOptions(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Edit Post
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowOptions(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Delete Post
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostHeader;
