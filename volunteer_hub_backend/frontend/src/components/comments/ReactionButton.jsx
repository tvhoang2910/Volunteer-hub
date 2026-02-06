import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const ReactionButton = ({ count, type = 'like', onClick, active, label }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-1 text-sm font-medium transition-colors group ${active ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            {type === 'like' && (
                <Heart
                    size={16}
                    className={`transition-transform group-active:scale-110 ${active ? 'fill-current' : ''}`}
                />
            )}
            {type === 'reply' && <MessageCircle size={16} />}

            <span>
                {label ? label : (count > 0 ? count : (type === 'reply' ? 'Trả lời' : 'Thích'))}
            </span>
        </button>
    );
};

export default ReactionButton;
