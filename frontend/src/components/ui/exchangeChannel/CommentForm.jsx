import React, { useState } from 'react';

export function CommentForm({ autoFocus, initialValue = '', onSubmit, loading, error }) {
    const [message, setMessage] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(message).then(() => setMessage(''));
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <textarea
                autoFocus={autoFocus}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a comment..."
                disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
                {loading ? 'Posting...' : 'Post'}
            </button>
            {error && <div className="error">{error}</div>}
        </form>
    );
}