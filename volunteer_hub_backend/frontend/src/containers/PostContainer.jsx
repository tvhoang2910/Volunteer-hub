import React, { useRef, useCallback } from 'react';
import { usePosts } from '../hooks/usePosts';
import Post from '../components/post/Post';
import CreatePostInput from '../components/post/CreatePostInput';
import PostSkeleton from '../components/post/PostSkeleton';

const PostContainer = () => {
    const {
        posts,
        loading,
        error,
        hasMore,
        loadMore,
        setPosts
    } = usePosts();

    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const handlePostDeleted = (deletedId) => {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedId));
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <CreatePostInput onPostCreated={handlePostCreated} />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {posts.map((post, index) => {
                    if (posts.length === index + 1) {
                        return (
                            <div ref={lastPostElementRef} key={post.id}>
                                <Post
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <Post
                                key={post.id}
                                post={post}
                                onPostDeleted={handlePostDeleted}
                            />
                        );
                    }
                })}
            </div>

            {loading && (
                <div className="mt-4">
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="text-center text-gray-500 py-8">
                    You&apos;ve reached the end of the feed.
                </div>
            )}

            {!loading && posts.length === 0 && !error && (
                <div className="text-center text-gray-500 py-8">
                    No posts yet. Be the first to post!
                </div>
            )}
        </div>
    );
};

export default PostContainer;
