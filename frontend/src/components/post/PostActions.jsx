import React from 'react';

const PostActions = ({ isLiked, onLike, onComment }) => {
    return (
        <div className="px-4 py-1">
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-1">
                <button
                    onClick={onLike}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md hover:bg-gray-100 transition-colors ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
                >
                    {isLiked ? (
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M14.6 2a.94.94 0 0 0-.58.19l-7.9 6.06a1 1 0 0 0-.3.4l-2.4 6.83a1 1 0 0 0 .93 1.32h4.36l-.82 4.49a1 1 0 0 0 1.6 1l6.9-6.93a1 1 0 0 0 .29-.7l.01-.01V3a1 1 0 0 0-1-1h-1.09z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                    )}
                    <span className="font-medium text-sm">Like</span>
                </button>

                <button
                    onClick={onComment}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="font-medium text-sm">Comment</span>
                </button>
            </div>
        </div>
    );
};

export default PostActions;
