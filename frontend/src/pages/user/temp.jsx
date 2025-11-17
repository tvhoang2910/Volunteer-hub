import React from "react"
import CreatePostBox from "@/components/ui/exchangeChannel/CreatePostBox.jsx"
import TextInputComment from "@/components/ui/exchangeChannel/textInput.jsx"
import PostContainer from "@/components/ui/exchangeChannel/PostCotainer.jsx"
import Emote from "@/components/ui/exchangeChannel/emote.jsx"
import CreatePostForm from "@/components/ui/exchangeChannel/createPostBar.jsx"
import Comment from "@/components/ui/exchangeChannel/commentBox.jsx"
export default function Temp() {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <CreatePostBox />
            {/* <CreatePostForm /> */}
            {/* <TextInputComment /> */}
            {/* <Emote /> */}
            <Comment />
            <PostContainer />
        </div>
    )
}

