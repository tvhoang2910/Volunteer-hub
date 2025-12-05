import { FaHeart, FaReply, FaTrash, FaEdit, FaRegHeart } from "react-icons/fa"
import CommentList from "./CommentList";
import { useState, useEffect } from "react";
import { usePost } from "@/context/PostContext";
import CommentForm from "./CommentForm";
import { useAsyncFn } from "@/hooks/useAsync";
import { createComment, deleteComment, updateComment, toggleCommentLike } from "@/services/comments";
import useUser from "@/hooks/useUser"

export default function Comment({ id, avatar, message, user, createdAt, likeCount, likedByMe }) {
    const { post, getReplies, createLocalComment, updateLocalComment, deleteLocalComment, toggleLocalCommentLike } = usePost()
    const childComments = getReplies(id)
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [userAvatar, setUserAvatar] = useState("https://random.imagecdn.app/200/200");
    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
    const toggleCommentLikeFn = useAsyncFn(toggleCommentLike)
    const [localTime, setLocalTime] = useState("")
    const currentUser = useUser()

    useEffect(() => {
        const date = new Date(createdAt)
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        const formattedDate = date.toLocaleDateString('en-US', options)
        setLocalTime(formattedDate)
    }, [createdAt])

    function onCommentReply(message) {
        return createCommentFn.execute({ postId: post.id, message, parentId: id }).then(comment => {
            setIsReplying(false)
            createLocalComment(comment)
        })
    }

    function onCommentUpdate(message) {
        return updateCommentFn
            .execute({ postId: post.id, message, id })
            .then(comment => {
                setIsEditing(false)
                updateLocalComment(id, comment.message)
            })
    }

    function onCommentDelete() {
        return deleteCommentFn
            .execute({ postId: post.id, id })
            .then((comment) => deleteLocalComment(comment.id)
            )
    }

    function onToggleCommentLike() {
        return toggleCommentLikeFn
            .execute({ id, postId: post.id })
            .then(({ addLike }) => toggleLocalCommentLike(id, addLike))
    }

    return (
        <>
            <div className="flex gap-2 mb-2 group">
                {/* Avatar */}
                <img
                    src={avatar || "https://random.imagecdn.app/200/200"}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                    alt={user.name}
                />

                <div className="flex-1 max-w-full">
                    <div className="flex items-start">
                        {/* Bubble */}
                        <div className="relative inline-block bg-[#f0f2f5] px-3 py-2 rounded-2xl max-w-full">
                            <span className="font-semibold text-[13px] text-[#050505] block leading-4 mb-0.5">
                                {user.name}
                            </span>

                            {isEditing ? (
                                <CommentForm
                                    autoFocus
                                    initialValue={message}
                                    onSubmit={onCommentUpdate}
                                    loading={updateCommentFn.loading}
                                    error={updateCommentFn.error}
                                />
                            ) : (
                                <div className="text-[15px] text-[#050505] leading-snug break-words whitespace-pre-wrap">
                                    {message}
                                </div>
                            )}

                            {/* Like count badge - Absolute positioned on the bubble */}
                            {likeCount > 0 && (
                                <div className="absolute -bottom-4 right-0 bg-white rounded-full shadow-md border border-white flex items-center gap-1 px-1 py-0.5 min-w-[20px] h-[20px] z-10 cursor-pointer">
                                    <div className="bg-blue-500 rounded-full p-0.5">
                                        <FaHeart className="text-white w-2 h-2" />
                                    </div>
                                    <span className="text-[11px] text-[#65676B] pr-1">{likeCount}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Line */}
                    <div className="flex gap-3 text-[12px] font-semibold text-[#65676B] mt-0.5 ml-3">
                        <span className="cursor-pointer hover:underline">
                            {localTime || "..."}
                        </span>

                        <button
                            onClick={onToggleCommentLike}
                            className={`hover:underline ${likedByMe ? "text-blue-600" : ""}`}
                        >
                            Thích
                        </button>

                        <button
                            onClick={() => setIsReplying(p => !p)}
                            className="hover:underline"
                        >
                            Phản hồi
                        </button>

                        {user.id === currentUser?.id && (
                            <>
                                <button
                                    onClick={() => setIsEditing(p => !p)}
                                    className="hover:underline"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={onCommentDelete}
                                    className="hover:underline"
                                >
                                    Xóa
                                </button>
                            </>
                        )}
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-2">
                            <CommentForm
                                autoFocus
                                onSubmit={onCommentReply}
                                loading={createCommentFn.loading}
                                error={createCommentFn.error}
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {childComments?.length > 0 && (
                        <div className="mt-2">
                            {/* Show/Hide Replies Button */}
                            {areChildrenHidden ? (
                                <button
                                    onClick={() => setAreChildrenHidden(false)}
                                    className="flex items-center gap-2 text-[13px] font-semibold text-[#65676B] hover:underline ml-3 mb-2"
                                >
                                    <div className="w-6 border-t border-[#65676B]"></div>
                                    Xem {childComments.length} câu trả lời
                                </button>
                            ) : (
                                <>
                                    <div className="pl-0">
                                        <CommentList comments={childComments} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
