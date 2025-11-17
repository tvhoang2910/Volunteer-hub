import React, { useState, useCallback, useMemo } from 'react';
import moment from 'moment';
import Action from './Action.jsx';
import SlideUpDetail from '../slide-up.jsx';

const Post = ({ post }) => {
    const [isReporting, setIsReporting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post?.likes || 0);
    const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);

    // Memoize user data
    const user = useMemo(() => post?.user || {}, [post?.user]);

    // Memoize time display
    const timeAgo = useMemo(() =>
        post?.createdAt ? moment(post.createdAt).fromNow() : '',
        [post?.createdAt]
    );

    // Optimize fetch comments with useCallback
    const fetchComments = useCallback(async (postId) => {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/${postId}/comments`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }
            const data = await response.json();
            return data.comments || [];
        } catch (error) {
            console.error("Error fetching comments:", error);
            return [];
        }
    }, []);

    const handleViewDetails = useCallback(async () => {
        if (!post?.id) return;
        setIsSlideUpOpen(true);
        await fetchComments(post.id);
    }, [post?.id, fetchComments]);

    const handleReport = useCallback(async () => {
        if (!post?.id) return;

        setIsReporting(true);
        setShowOptions(false);

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports`;
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId: post.id,
                    reason: "Inappropriate content",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to report post");
            }

            alert("Post reported successfully.");
        } catch (error) {
            console.error("Error reporting post:", error);
            alert("Error reporting post. Please try again later.");
        } finally {
            setIsReporting(false);
        }
    }, [post?.id]);

    const handleLike = useCallback(() => {
        setIsLiked(prev => !prev);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    }, [isLiked]);

    const toggleOptions = useCallback(() => {
        setShowOptions(prev => !prev);
    }, []);

    // Early return if no post
    if (!post) return null;

    return (
        <div className="w-full rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 dark:bg-neutral-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 ring-2 ring-gray-100 dark:ring-neutral-700 rounded-full flex-shrink-0">
                        <img
                            src={user.dp || '/default-avatar.png'}
                            alt={user.fullName || 'User'}
                            className="h-full w-full rounded-full object-cover"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:underline cursor-pointer truncate">
                            {user.fullName || 'Anonymous'}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {timeAgo}
                        </span>
                    </div>
                </div>

                <div className="relative">
                    <button
                        className="h-9 w-9 flex items-center justify-center rounded-full 
                            hover:bg-gray-100 dark:hover:bg-neutral-700 
                            transition-all duration-200 hover:scale-110"
                        aria-label="Options"
                        onClick={toggleOptions}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            className="w-5 h-5 text-gray-600 dark:text-gray-300"
                        >
                            <circle cx="3" cy="10" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="17" cy="10" r="2" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showOptions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-10 animate-fadeIn">
                            <button
                                onClick={handleReport}
                                disabled={isReporting}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-flag" />
                                <span>{isReporting ? 'Reporting...' : 'Report Post'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Caption */}
            {post.caption && (
                <p className="px-4 mb-3 text-sm text-gray-700 dark:text-gray-300 break-words leading-relaxed whitespace-pre-wrap">
                    {post.caption}
                </p>
            )}

            {/* Image */}
            {post.image && (
                <div className="w-full bg-gray-100 dark:bg-neutral-900">
                    <img
                        src={post.image}
                        alt="Post content"
                        className="w-full max-h-[500px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Footer */}
            <div className="p-4 space-y-3">
                {/* Reactions Summary */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="flex -space-x-1">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transform hover:scale-110 transition-transform">
                                <i style={{ fontSize: 11 }} className="fas fa-heart" />
                            </span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transform hover:scale-110 transition-transform">
                                <i style={{ fontSize: 11 }} className="fas fa-thumbs-up" />
                            </span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-white shadow-sm transform hover:scale-110 transition-transform">
                                <i style={{ fontSize: 11 }} className="fas fa-surprise" />
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 hover:underline cursor-pointer">
                            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                        </p>
                    </div>
                    <button
                        className="text-gray-600 dark:text-gray-400 hover:underline transition-colors"
                        onClick={handleViewDetails}
                    >
                        {post.comments || 0} {post.comments === 1 ? 'Comment' : 'Comments'}
                    </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-neutral-700" />

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 text-sm">
                    <button
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${isLiked
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
                            }`}
                        aria-pressed={isLiked}
                        aria-label={isLiked ? 'Unlike post' : 'Like post'}
                    >
                        <i className={`fas fa-thumbs-up ${isLiked ? 'animate-bounce-once' : ''}`} />
                        <span>Like</span>
                    </button>
                    <Action
                        className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200"
                        icon="fas fa-comment"
                        label="Comment"
                        onClick={() => {
                            console.log("Comment clicked");
                            handleViewDetails();
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                @keyframes bounceOnce {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                }
                
                .animate-bounce-once {
                    animation: bounceOnce 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default React.memo(Post);