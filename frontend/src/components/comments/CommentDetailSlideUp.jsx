import React from 'react';
import SlideUpDetail from '../ui/slide-up';
import CommentList from './CommentList';
import { PostProvider } from '../../context/PostContext';
import mockComments from '../../data/Comment_data.json';

const CommentDetailSlideUp = ({ isOpen, onClose, post, comments }) => {
    // Use mock data if comments prop is empty or for testing purposes as requested
    const displayComments = (comments && comments.length > 0) ? comments : mockComments;

    // Filter root comments (those without a parentId)
    const rootComments = displayComments.filter(comment => !comment.parentId);

    return (
        <PostProvider post={post} comments={displayComments}>
            <SlideUpDetail
                isOpen={isOpen}
                onClose={onClose}
                title={`Bình luận (${displayComments.length})`}
                className="h-[80vh]"
            >
                <div className="flex flex-col h-full">
                    <CommentList comments={rootComments} />
                </div>
            </SlideUpDetail>
        </PostProvider>
    );
};

export default CommentDetailSlideUp;
