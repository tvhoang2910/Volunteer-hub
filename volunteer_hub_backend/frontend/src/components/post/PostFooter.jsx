import React from 'react';

const PostFooter = ({ likes, comments, onViewComments }) => {
    return (
        <div className="px-4 pb-2">
            {/* Stats Row */}
            <div className="flex items-center justify-between py-2 text-gray-500 text-sm">
                <div className="flex items-center cursor-pointer hover:underline">
                    {likes > 0 && (
                        <>
                            <div className="bg-blue-500 rounded-full p-1 mr-1">
                                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M14.6 2a.94.94 0 0 0-.58.19l-7.9 6.06a1 1 0 0 0-.3.4l-2.4 6.83a1 1 0 0 0 .93 1.32h4.36l-.82 4.49a1 1 0 0 0 1.6 1l6.9-6.93a1 1 0 0 0 .29-.7l.01-.01V3a1 1 0 0 0-1-1h-1.09z" />
                                </svg>
                            </div>
                            <span>{likes}</span>
                        </>
                    )}
                </div>

                <div className="flex space-x-3">
                    {comments > 0 && (
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={onViewComments}
                        >
                            {comments} comments
                        </span>
                    )}
                    <span className="cursor-pointer hover:underline">0 shares</span>
                </div>
            </div>

            {/* Comment Preview (Mock) */}
            {comments > 0 && (
                <div className="mt-2">
                    <div
                        className="text-gray-500 font-medium text-sm cursor-pointer hover:underline mb-2"
                        onClick={onViewComments}
                    >
                        View more comments
                    </div>

                    {/* Fake single comment preview */}
                    <div className="flex space-x-2 mb-2">
                        <img
                            src="https://i.pravatar.cc/150?u=888"
                            alt="User"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 text-sm">
                            <span className="font-bold text-gray-900 mr-2">Random User</span>
                            <span className="text-gray-800">This is a great post!</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostFooter;
