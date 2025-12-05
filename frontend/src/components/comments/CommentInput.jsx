import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';

const CommentInput = ({ onSubmit, placeholder = "Viết bình luận...", autoFocus = false, initialValue = "" }) => {
    const [text, setText] = useState(initialValue);
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [text]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSubmit(text);
        setText("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <div className="flex gap-3 items-start w-full">
            <Avatar className="w-8 h-8 mt-1" />
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full p-3 bg-gray-100 rounded-2xl border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none resize-none overflow-hidden text-sm min-h-[44px] transition-all"
                    rows={1}
                />
                <div className="mt-2 flex justify-end">
                    <button
                        disabled={!text.trim()}
                        onClick={handleSubmit}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${text.trim()
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Bình luận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentInput;
