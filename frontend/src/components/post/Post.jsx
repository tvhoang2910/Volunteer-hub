import React, { useState } from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostFooter from './PostFooter';
import EditPostModal from './EditPostModal';
import { useDeletePost } from '../../hooks/useDeletePost';
import { useToggleReaction } from '../../hooks/useToggleReaction';

const Post = ({ post, onPostUpdated, onPostDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localPost, setLocalPost] = useState(post);

    const { deletePost } = useDeletePost(onPostDeleted);
    const { toggleReaction } = useToggleReaction();

    // Assume current user ID is 999 for demo purposes
    const currentUserId = 999;
    const isOwner = localPost.user.id === currentUserId;

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deletePost(localPost.id);
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

            <PostFooter
                likes={localPost.likes}
                comments={localPost.comments}
                onViewComments={() => console.log('View comments clicked')}
            />

            <PostActions
                isLiked={localPost.isLiked}
                onLike={handleLike}
                onComment={() => console.log('Comment clicked')}
                onShare={() => console.log('Share clicked')}
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
