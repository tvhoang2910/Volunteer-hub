import React, { createContext, useContext, useState, useEffect } from 'react';

const PostContext = createContext();

export const PostProvider = ({ children, post, comments: initialComments = [] }) => {
    const [currentPost, setCurrentPost] = useState(post);
    const [comments, setComments] = useState(initialComments);

    useEffect(() => {
        setCurrentPost(post);
        setComments(initialComments);
    }, [post, initialComments]);

    const getReplies = (parentId) => {
        return comments.filter(comment => comment.parentId === parentId);
    };

    const createLocalComment = (comment) => {
        setComments(prev => [...prev, comment]);
    };

    const updateLocalComment = (id, message) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, message } : c));
    };

    const deleteLocalComment = (id) => {
        setComments(prev => prev.filter(c => c.id !== id));
    };

    const toggleLocalCommentLike = (id, addLike) => {
        setComments(prev => prev.map(c =>
            c.id === id ? { ...c, likeCount: addLike ? c.likeCount + 1 : c.likeCount - 1, likedByMe: addLike } : c
        ));
    };

    return (
        <PostContext.Provider value={{
            post: currentPost,
            getReplies,
            createLocalComment,
            updateLocalComment,
            deleteLocalComment,
            toggleLocalCommentLike
        }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePost = () => useContext(PostContext);