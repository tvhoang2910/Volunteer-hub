import { FaHeart, FaReply, FaTrash, FaEdit, FaRegHeart, FaThumbsUp } from "react-icons/fa"
import CommentList from "./CommentList";
import { useState, useEffect } from "react";
import { usePost } from "@/context/PostContext";
import CommentForm from "./CommentForm";
import { updateComment, deleteComment } from "@/services/commentService";
import useUser from "@/hooks/useUser"

// Props từ API: { id, content, userId, userName, postId, parentId, replies, createdAt, updatedAt }
export default function Comment({ id, content, userId, userName, postId, parentId, replies: initialReplies, createdAt, updatedAt }) {
    const { post } = usePost()
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [localMessage, setLocalMessage] = useState(content)
    const [localReplies, setLocalReplies] = useState(initialReplies || [])
    const [isDeleted, setIsDeleted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [localTime, setLocalTime] = useState("")
    const currentUser = useUser()

    useEffect(() => {
        if (createdAt) {
            const date = new Date(createdAt)
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            const formattedDate = date.toLocaleDateString('vi-VN', options)
            setLocalTime(formattedDate)
        }
    }, [createdAt])

    // Update localReplies when initialReplies changes
    useEffect(() => {
        setLocalReplies(initialReplies || [])
    }, [initialReplies])

    const handleUpdate = async (newMessage) => {
        setLoading(true)
        setError(null)
        try {
            const updated = await updateComment(id, newMessage)
            setLocalMessage(updated.content || newMessage)
            setIsEditing(false)
        } catch (err) {
            console.error('Error updating comment:', err)
            setError('Không thể cập nhật bình luận')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return
        setLoading(true)
        try {
            await deleteComment(id)
            setIsDeleted(true)
        } catch (err) {
            console.error('Error deleting comment:', err)
            setError('Không thể xóa bình luận')
        } finally {
            setLoading(false)
        }
    }

    const handleReplyAdded = (newReply) => {
        setIsReplying(false)
        // Thêm reply mới vào local state để hiển thị ngay
        setLocalReplies(prev => [...prev, newReply])
    }

    if (isDeleted) return null

    const isOwner = currentUser?.id === userId

    return (
        <>
            <div className="flex gap-2 mb-2 group">
                {/* Avatar */}
                <img
                    src="https://random.imagecdn.app/200/200"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                    alt={userName}
                />

                <div className="flex-1 max-w-full">
                    <div className="flex items-start">
                        {/* Bubble */}
                        <div className="relative inline-block bg-[#f0f2f5] px-3 py-2 rounded-2xl max-w-full">
                            <span className="font-semibold text-[13px] text-[#050505] block leading-4 mb-0.5">
                                {userName || 'Người dùng'}
                            </span>

                            {isEditing ? (
                                <CommentForm
                                    autoFocus
                                    initialValue={localMessage}
                                    postId={postId}
                                    onSubmit={handleUpdate}
                                />
                            ) : (
                                <div className="text-[15px] text-[#050505] leading-snug break-words whitespace-pre-wrap">
                                    {localMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Line */}
                    <div className="flex gap-3 text-[12px] font-semibold text-[#65676B] mt-0.5 ml-3">
                        <span className="cursor-pointer hover:underline font-normal">
                            {localTime || "..."}
                        </span>

                        <button
                            onClick={() => setIsReplying(p => !p)}
                            className="hover:underline"
                        >
                            Phản hồi
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    onClick={() => setIsEditing(p => !p)}
                                    className="hover:underline"
                                    disabled={loading}
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="hover:underline"
                                    disabled={loading}
                                >
                                    Xóa
                                </button>
                            </>
                        )}
                    </div>
                    {error && <div className="text-red-500 text-xs ml-3 mt-1">{error}</div>}

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-2">
                            <CommentForm
                                autoFocus
                                postId={postId || post?.id}
                                parentId={id}
                                onCommentAdded={handleReplyAdded}
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {localReplies?.length > 0 && (
                        <div className="mt-2">
                            {areChildrenHidden ? (
                                <button
                                    onClick={() => setAreChildrenHidden(false)}
                                    className="flex items-center gap-2 text-[13px] font-semibold text-[#65676B] hover:underline ml-3 mb-2"
                                >
                                    <div className="w-6 border-t border-[#65676B]"></div>
                                    Xem {localReplies.length} câu trả lời
                                </button>
                            ) : (
                                <div className="pl-0 border-l-2 border-gray-200 ml-3.5">
                                    <CommentList comments={localReplies} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
