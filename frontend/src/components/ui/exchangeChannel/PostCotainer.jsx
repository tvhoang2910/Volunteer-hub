import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Post from "./postBox.jsx";

const BATCH_SIZE = 2; // số post load mỗi lần

const postsData = [{ _id: "1", user: { _id: "1", username: "shihab", fullName: "Saiful Islam Shihab", dp: "https://random.imagecdn.app/500/200" }, caption: "This is post caption", image: "https://random.imagecdn.app/1920/1081", likes: 129, comments: 5, shares: 0, createdAt: new Date(), updatedAt: new Date() }, { _id: "2", user: { _id: "1", fullName: "Saiful Islam Shihab", username: "shihab", dp: "https://random.imagecdn.app/500/200" }, caption: "This is post caption", image: "https://random.imagecdn.app/1920/1070", likes: 798, comments: 52, shares: 10, createdAt: new Date(), updatedAt: new Date() }, { _id: "3", user: { _id: "1", fullName: "Saiful Islam Shihab", username: "shihab", dp: "https://random.imagecdn.app/500/200" }, caption: "This is post caption", image: "https://random.imagecdn.app/1920/1060", likes: 456, comments: 15, shares: 80, createdAt: new Date(), updatedAt: new Date() }, { _id: "4", user: { _id: "1", fullName: "Saiful Islam Shihab", username: "shihab", dp: "https://random.imagecdn.app/500/200" }, caption: "This is post caption", image: "https://random.imagecdn.app/1920/1050", likes: 29, comments: 1, shares: 2, createdAt: new Date(), updatedAt: new Date() }];
async function fetchPosts() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        return data.posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}
const PostContainer = ({ postsView }) => {

    const [visiblePosts, setVisiblePosts] = useState([]);
    const [batch, setBatch] = useState(1);
    const loaderRef = useRef(null);

    // Load theo batch
    const loadMorePosts = () => {
        const start = 0;
        const end = batch * BATCH_SIZE;
        setVisiblePosts(postsData.slice(start, end));
    };

    // Gọi mỗi khi batch thay đổi
    useEffect(() => {
        loadMorePosts();
    }, [batch]);

    // IntersectionObserver để tăng batch khi chạm cuối
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setBatch((prev) => prev + 1);
                }
            },
            { threshold: 1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="mt-4 h-full w-full">

            <div
                className={cn(
                    "grid gap-2",
                    postsView === "gridView" ? "grid-cols-2" : "grid-cols-1"
                )}
            >
                {visiblePosts.length ? (
                    visiblePosts.map((post, idx) => (
                        <Post key={idx} post={post} />
                    ))
                ) : (
                    <p>No posts yet!</p>
                )}
            </div>

            {/* Scroll loader trigger */}
            <div ref={loaderRef} style={{ height: "30px" }} />

        </div>
    );
};

export default PostContainer;