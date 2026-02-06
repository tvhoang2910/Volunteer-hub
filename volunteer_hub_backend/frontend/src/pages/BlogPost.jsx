import React from 'react';
import CommentList from '../components/comments/CommentList';

const BlogPost = () => {
    // Mock post ID
    const postId = "9975";

    return (
        <div className="min-h-screen bg-gray-50 py-10 font-sans">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white p-8 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Bài viết mẫu F8 (Clone)</h1>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Đây là nội dung bài viết mô phỏng. Hệ thống bình luận ở phía dưới đã được tích hợp đầy đủ tính năng.
                    </p>
                    <div className="prose max-w-none bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                        <p className="font-semibold mb-2">Tính năng đã implement:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Hiển thị danh sách comment và reply (nested)</li>
                            <li>Lazy load replies khi bấm &quot;Xem câu trả lời&quot;</li>
                            <li>Markdown ảnh: <code>![alt](url)</code></li>
                            <li>Mention: <code>&lt;user-mention&gt;</code></li>
                            <li>Thêm comment và reply mới (Optimistic UI)</li>
                        </ul>
                    </div>
                </div>

                <CommentList postId={postId} />
            </div>
        </div>
    );
};

export default BlogPost;
