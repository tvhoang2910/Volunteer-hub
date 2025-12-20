import React from 'react';

const PostContent = ({ content }) => {
    const renderContent = (text) => {
        if (!text) return null;

        // Split by space to find hashtags and links
        const words = text.split(/(\s+)/);

        return words.map((word, index) => {
            if (word.startsWith('#')) {
                return (
                    <span key={index} className="text-blue-600 hover:underline cursor-pointer font-medium">
                        {word}
                    </span>
                );
            }
            if (word.match(/^(http|https):\/\/[^ "]+$/)) {
                return (
                    <a
                        key={index}
                        href={word}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                    >
                        {word}
                    </a>
                );
            }
            return <span key={index}>{word}</span>;
        });
    };

    return (
        <div className="px-4 pb-2 text-gray-900 text-[15px] leading-normal whitespace-pre-wrap">
            {renderContent(content)}
        </div>
    );
};

export default PostContent;
