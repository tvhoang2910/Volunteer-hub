import React, { useState } from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostFooter from './PostFooter';
import EditPostModal from './EditPostModal';
import { useDeletePost } from '../../hooks/useDeletePost';
import { useToggleReaction } from '../../hooks/useToggleReaction';
import CommentDetailSlideUp from '../comments/CommentDetailSlideUp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Convert relative avatar path to full backend URL
const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_BASE_URL}${avatarPath}`;
};

const Post = ({ post, onPostUpdated, onPostDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showComments, setShowComments] = useState(false);
    
    // Normalize post data to handle both API response formats (author vs user, postId vs id)
    const normalizePost = (postData) => {
        const author = postData.user || postData.author || { id: null, name: 'Unknown', avatarUrl: null };
        return {
            ...postData,
            id: postData.id || postData.postId,
            user: {
                ...author,
                // Normalize avatar field and convert to full URL
                avatar: getFullAvatarUrl(author.avatar || author.avatarUrl),
            },
            media: postData.media || postData.imageUrls || [],
            likes: postData.likes ?? postData.reactionCount ?? 0,
            comments: postData.comments ?? postData.commentCount ?? 0,
            // Map likedByViewer from API to isLiked
            isLiked: postData.isLiked ?? postData.likedByViewer ?? false,
        };
    };
    
    const [localPost, setLocalPost] = useState(() => normalizePost(post));

    const { deletePost } = useDeletePost(onPostDeleted);
    const { toggleReaction } = useToggleReaction();

    // Lấy userId từ localStorage (userId được lưu khi đăng nhập)
    const currentUserId = localStorage.getItem('userId');
    const isOwner = localPost.user?.id === currentUserId;

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const postId = localPost.id || localPost.postId;
            console.log('[Post] Deleting post with id:', postId);
            await deletePost(postId);
        }
    };

    const handleLike = async () => {
        // Optimistic update
        const wasLiked = localPost.isLiked;
        setLocalPost(prev => ({
            ...prev,
            isLiked: !wasLiked,
            likes: wasLiked ? prev.likes - 1 : prev.likes + 1
        }));

        const success = await toggleReaction(localPost.id);
        if (!success) {
            // Revert if failed
            setLocalPost(prev => ({
                ...prev,
                isLiked: wasLiked,
                likes: wasLiked ? prev.likes : prev.likes - 1 // Revert count
            }));
        }
    };

    const handleUpdateSuccess = (updatedData) => {
        setLocalPost(prev => ({ ...prev, ...updatedData }));
        if (onPostUpdated) onPostUpdated(updatedData);
    };

    return (
        <div className="bg-white rounded-lg shadow mb-4">
            <PostHeader
                user={localPost.user}
                createdAt={localPost.createdAt}
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
                isOwner={isOwner}
            />

            <PostContent content={localPost.content} />

            <PostMedia media={localPost.media} />

            {/* <PostFooter
                likes={localPost.likes}
                comments={localPost.comments}
                onViewComments={() => console.log('View comments clicked')}
            /> */}

            <PostActions
                isLiked={localPost.isLiked}
                onLike={handleLike}
                onComment={() => setShowComments(true)}
            // onShare={() => console.log('Share clicked')}
            />

            <CommentDetailSlideUp
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                post={localPost}
            />

            {isEditing && (
                <EditPostModal
                    post={localPost}
                    onClose={() => setIsEditing(false)}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default Post;
