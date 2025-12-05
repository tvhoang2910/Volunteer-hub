import React from 'react';
import MentionParser from './MentionParser';

const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    // Split by markdown image syntax ![alt](url)
    const parts = content.split(/(!\[.*?\]\(.*?\))/g);

    return (
        <div className="text-gray-800 text-[15px] leading-relaxed break-words">
            {parts.map((part, index) => {
                const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
                if (imgMatch) {
                    return (
                        <img
                            key={index}
                            src={imgMatch[2]}
                            alt={imgMatch[1]}
                            className="w-full max-w-md h-auto rounded-lg my-2 object-cover border border-gray-200"
                            loading="lazy"
                        />
                    );
                }
                // Pass text parts to MentionParser
                return <MentionParser key={index} content={part} />;
            })}
        </div>
    );
};

export default MarkdownRenderer;
