import { useState, useEffect } from "react";

export const useComments = () => {
    const [comments, setComments] = useState([]);

    const addComment = (comment) => setComments((prev) => [...prev, comment]);
    const updateComment = (comment) =>
        setComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)));

    useEffect(() => {
        fetch("/api/comments")
            .then((res) => res.json())
            .then(setComments);
    }, []);

    return { comments, addComment, updateComment };
};