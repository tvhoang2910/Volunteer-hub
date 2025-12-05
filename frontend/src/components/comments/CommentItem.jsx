import React, { useState } from 'react';
import Avatar from './Avatar';
import ReactionButton from './ReactionButton';
import MarkdownRenderer from './MarkdownRenderer';
import CommentInput from './CommentInput';
import ReplyList from './ReplyList';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const CommentItem = ({ comment, onReply, onLoadReplies }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.reactions_count);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
    };

    const handleReplySubmit = (text) => {
        onReply(comment.id, text);
        setIsReplying(false);
    };

    return (
        <div className="flex gap-3 mb-6 group animate-in fade-in duration-500">
            <Avatar src={comment.commentator.data.avatar_url} />

            <div className="flex-1">
                {/* Content */}
                <div className="">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                            {comment.commentator.data.full_name}
                        </span>
                        {comment.commentator.data.is_pro && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded font-bold">PRO</span>
                        )}
                    </div>

                    <div className="mt-1">
                        <MarkdownRenderer content={comment.comment} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2 ml-0">
                    <ReactionButton
                        count={likeCount}
                        active={liked}
                        onClick={handleLike}
                    />
                    <ReactionButton
                        type="reply"
                        onClick={() => setIsReplying(!isReplying)}
                    />
                    <span className="text-xs text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
                    </span>
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-3">
                        <CommentInput
                            placeholder={`Trả lời ${comment.commentator.data.full_name}...`}
                            onSubmit={handleReplySubmit}
                            autoFocus
                        />
                    </div>
                )}

                {/* Replies Section */}
                {(comment.replies_count > 0 || (comment.replies && comment.replies.length > 0)) && (
                    <div className="mt-2">
                        {/* Show "View Replies" button if not loaded or hidden */}
                        {!comment.showReplies && comment.replies_count > 0 ? (
                            <button
                                onClick={() => onLoadReplies(comment.id)}
                                className="text-sm font-semibold text-gray-600 hover:underline flex items-center gap-2 mt-2"
                            >
                                <div className="w-8 border-t border-gray-300"></div>
                                Xem {comment.replies_count} câu trả lời
                            </button>
                        ) : (
                            <ReplyList replies={comment.replies} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
