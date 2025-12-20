import React from 'react';

const Avatar = ({ src, alt, className = '' }) => {
    return (
        <img
            src={src || 'https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f9a2fd4e064.jpg'}
            alt={alt || 'User Avatar'}
            className={`w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0 ${className}`}
            onError={(e) => {
                e.target.src = 'https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f9a2fd4e064.jpg';
            }}
        />
    );
};

export default Avatar;
