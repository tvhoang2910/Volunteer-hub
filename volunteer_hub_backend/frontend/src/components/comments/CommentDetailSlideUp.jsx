import React, { useState, useEffect } from 'react';
import SlideUpDetail from '../ui/slide-up';
import CommentList from './CommentList';
import { PostProvider } from '../../context/PostContext';
import { fetchComments } from '../../services/commentService';
import CommentForm from './CommentForm';

const CommentDetailSlideUp = ({ isOpen, onClose, post }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && post?.id) {
            loadComments();
        }
    }, [isOpen, post?.id]);

    const loadComments = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchComments(post.id);
            // API trả về Page<CommentResponse> với field content
            const commentList = result?.content || result || [];
            setComments(commentList);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    // Filter root comments (those without a parentId)
    const rootComments = comments.filter(comment => !comment.parentId);

    const handleCommentAdded = (newComment) => {
        setComments(prev => [newComment, ...prev]);
    };

    return (
        <PostProvider post={post} comments={comments}>
            <SlideUpDetail
                isOpen={isOpen}
                onClose={onClose}
                title={`Bình luận (${comments.length})`}
                className="h-[80vh]"
            >
                <div className="flex flex-col h-full">
                    {/* Comments section - scrollable */}
                    <div className="flex-1 overflow-y-auto pb-20">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-4">{error}</div>
                        ) : rootComments.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                            </div>
                        ) : (
                            <CommentList comments={rootComments} />
                        )}
                    </div>
                    
                    {/* Comment form - fixed at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white">
                        <CommentForm 
                            postId={post?.id}
                            onCommentAdded={handleCommentAdded}
                        />
                    </div>
                </div>
            </SlideUpDetail>
        </PostProvider>
    );
};

export default CommentDetailSlideUp;
