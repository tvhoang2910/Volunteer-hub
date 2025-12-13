import React from 'react'
import Comment from "@/components/comments/Comment"
import { PostProvider } from "@/context/PostContext"
import CommentList from "@/components/comments/CommentList"
import CreatePostInput from "@/components/post/CreatePostInput"
import PostContainer from "@/containers/PostContainer"
import CommentForm from '@/components/comments/CommentForm'
import CommentInput from '@/components/comments/CommentInput'

export default function Temp() {
    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* <PostContainer /> */}
            <CommentList comments={[]} />

        </div>
    )
}
