import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

export default function CommentForm({ autoFocus, initialValue = '', onSubmit, loading, error }) {
    const [message, setMessage] = useState(initialValue);
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSubmit(message).then(() => setMessage(''));
    };

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [message]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-end gap-2 bg-[#f0f2f5] rounded-2xl px-3 py-2">
                <textarea
                    ref={textareaRef}
                    autoFocus={autoFocus}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Viết bình luận..."
                    disabled={loading}
                    rows={1}
                    className="w-full bg-transparent border-none outline-none text-[15px] text-[#050505] resize-none overflow-hidden py-1 placeholder-gray-500"
                    style={{ minHeight: '24px' }}
                />
                <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className={`mb-1 p-1 transition-colors ${!message.trim() ? 'text-gray-400 cursor-default' : 'text-blue-500 hover:bg-gray-200 rounded-full cursor-pointer'
                        }`}
                >
                    <FaPaperPlane size={16} />
                </button>
            </div>
            {error && <div className="text-red-500 text-xs mt-1 ml-2">{error}</div>}
        </form>
    );
}
