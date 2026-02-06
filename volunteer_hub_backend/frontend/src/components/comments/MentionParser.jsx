import React from 'react';

const MentionParser = ({ content }) => {
    if (!content) return null;

    // Split by mention tag
    const parts = content.split(/(<user-mention.*?>.*?<\/user-mention>)/g);

    return (
        <span>
            {parts.map((part, index) => {
                const match = part.match(/<user-mention data-id="(.*?)">(.*?)<\/user-mention>/);
                if (match) {
                    return (
                        <a
                            key={index}
                            href={`/user/${match[1]}`}
                            className="font-bold text-orange-600 hover:underline cursor-pointer"
                        >
                            {match[2]}
                        </a>
                    );
                }
                // Render plain text
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default MentionParser;
