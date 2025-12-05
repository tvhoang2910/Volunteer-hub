import React from 'react';
import ReplyItem from './ReplyItem';

const ReplyList = ({ replies }) => {
    if (!replies || replies.length === 0) return null;

    return (
        <div className="mt-2 pl-0">
            {replies.map(reply => (
                <ReplyItem key={reply.id} reply={reply} />
            ))}
        </div>
    );
};

export default ReplyList;
