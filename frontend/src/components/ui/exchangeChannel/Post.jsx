import React from 'react';
import { PostProvider } from '../../../context/PostContext';
import { Comment } from './commentBox';

export function Post({ id, title, content, comments }) {
    const post = { id, title, content };

    return (
        <PostProvider post={post} comments={comments}>
            <div className="post">
                <h3>{title}</h3>
                <p>{content}</p>
                <div className="comments">
                    {comments.map(comment => (
                        <Comment key={comment.id} {...comment} />
                    ))}
                </div>
            </div>
        </PostProvider>
    );
}