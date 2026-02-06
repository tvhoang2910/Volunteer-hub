import React, { useState } from 'react';
import Avatar from './Avatar';
import ReactionButton from './ReactionButton';
import MarkdownRenderer from './MarkdownRenderer';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReplyItem = ({ reply }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(reply.reactions_count || 0);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
    };

    return (
        <div className="flex gap-3 mb-3 group">
            <Avatar src={reply.commentator.data.avatar_url} className="w-6 h-6" />

            <div className="flex-1">
                <div className="bg-gray-50/50 rounded-lg p-2 -ml-2 hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm text-gray-900">
                            {reply.commentator.data.full_name}
                        </span>
                        {reply.commentator.data.is_pro && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded font-bold">PRO</span>
                        )}
                    </div>

                    <div className="mt-0.5">
                        <MarkdownRenderer content={reply.comment} />
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-1 ml-1">
                    <ReactionButton
                        count={likeCount}
                        active={liked}
                        onClick={handleLike}
                    />
                    <span className="text-xs text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: vi })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;
