import React from 'react';
import { Comment } from './commentBox';

const CommentList = ({ comments }) => {
    return (
        <div className="comment-list">
            {comments.map(comment => (
                <Comment key={comment.id} {...comment} />
            ))}
        </div>
    );
};

export default CommentList;