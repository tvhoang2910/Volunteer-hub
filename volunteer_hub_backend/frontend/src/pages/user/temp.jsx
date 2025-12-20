import React from 'react'
import Comment from "@/components/comments/Comment"
import { PostProvider } from "@/context/PostContext"
import CommentList from "@/components/comments/CommentList"
import CreatePostInput from "@/components/post/CreatePostInput"
import PostContainer from "@/containers/PostContainer"
import CommentForm from '@/components/comments/CommentForm'
import CommentInput from '@/components/comments/CommentInput'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from '@/components/ui/toast'
export default function Temp() {
    return (
        <ToastProvider>
            <Toast variant="destructive" open={true}>
                <ToastTitle>Lỗi</ToastTitle>
                <ToastDescription>Không thể lưu dữ liệu</ToastDescription>
                <ToastClose />
            </Toast>
            <ToastViewport />
        </ToastProvider>
    )
}
