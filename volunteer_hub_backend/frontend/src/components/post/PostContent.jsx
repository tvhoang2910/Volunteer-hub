import React from 'react';

// Simple HTML sanitizer without external dependency
const sanitizeHTML = (html) => {
    if (typeof window === 'undefined') return html;
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Remove script tags and event handlers
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove dangerous attributes
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove event handlers (onclick, onerror, etc.)
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
        // Remove javascript: URLs
        if (el.hasAttribute('href') && el.getAttribute('href')?.startsWith('javascript:')) {
            el.removeAttribute('href');
        }
        if (el.hasAttribute('src') && el.getAttribute('src')?.startsWith('javascript:')) {
            el.removeAttribute('src');
        }
    });
    
    return doc.body.innerHTML;
};

const PostContent = ({ content }) => {
    if (!content) return null;

    // Check if content contains HTML tags
    const isHTML = /<[a-z][\s\S]*>/i.test(content);

    if (isHTML) {
        // Sanitize HTML content to prevent XSS
        const sanitizedContent = sanitizeHTML(content);

        return (
            <div 
                className="px-4 pb-2 text-gray-900 text-[15px] leading-normal prose prose-sm max-w-none
                    [&_p]:my-1 [&_a]:text-blue-600 [&_a:hover]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
        );
    }

    // Fallback for plain text content
    const renderContent = (text) => {
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
