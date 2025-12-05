import React, { useState } from 'react';
import { useUpdatePost } from '../../hooks/useUpdatePost';

const EditPostModal = ({ post, onClose, onUpdateSuccess }) => {
    const [content, setContent] = useState(post.content);
    const { updatePost, loading } = useUpdatePost(onUpdateSuccess);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        const formData = new FormData();
        formData.append('content', content);
        // Note: Media editing logic can be added here similar to CreatePostInput

        try {
            await updatePost(post.id, formData);
            onClose();
        } catch (error) {
            console.error("Failed to update post", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Edit Post</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <img
                            src={post.user.avatar}
                            alt={post.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-bold text-sm">{post.user.name}</div>
                            <div className="text-xs text-gray-500">Public</div>
                        </div>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-lg"
                        placeholder="What's on your mind?"
                    />

                    {/* Existing media preview could go here */}
                </div>

                <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || loading}
                        className={`px-6 py-2 rounded-md font-semibold text-white transition-colors ${!content.trim() || loading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;
