import React from 'react'
import Comment from "@/components/comments/Comment"
import { PostProvider } from "@/context/PostContext"
import CommentList from "@/components/comments/CommentList"
import CreatePostInput from "@/components/post/CreatePostInput"
import PostSkeleton from "@/components/post/PostSkeleton"
import PostContainer from "@/containers/PostContainer"

export default function Temp() {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <CreatePostInput />

            <PostProvider post={{ id: "temp-post" }} comments={[]}>
                <Comment
                    id="temp-comment"
                    message="This is powerful  "
                    user={{ name: "Test User", id: "user-1" }}
                    createdAt={new Date().toISOString()}
                    likeCount={0}
                    likedByMe={false}
                />
            </PostProvider>

            <PostContainer />
            <CommentList comments={[]} />
        </div>
    )
}
