import React from 'react';

const PostSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4 animate-pulse">
            <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    );
};

export default PostSkeleton;
