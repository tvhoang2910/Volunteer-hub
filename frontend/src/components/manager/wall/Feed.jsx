"use client";

import React, { useEffect, useMemo, useState } from "react";
import CreatePostInput from "@/components/post/CreatePostInput";
import Post from "@/components/post/Post";

function normalizeMedia(media) {
  if (!media) return [];
  if (Array.isArray(media)) {
    return media.map((item) =>
      typeof item === "string"
        ? { type: "image", url: item }
        : { type: item.type || "image", url: item.url }
    );
  }
  if (typeof media === "string") {
    return [{ type: "image", url: media }];
  }
  return [];
}

function toPostShape(raw, groupLookup) {
  const group = raw.group || groupLookup?.get?.(raw.groupId);
  const createdAt = raw.createdAt || new Date().toISOString();

  return {
    id: raw.id,
    user: {
      id: raw.authorId || group?.id || raw.id,
      name: raw.author || group?.name || "Manager",
      avatar: group?.avatar || raw.avatar || "https://i.pravatar.cc/150?u=manager",
    },
    content: group?.name ? `[${group.name}] ${raw.content}` : raw.content,
    media: normalizeMedia(raw.media),
    likes: raw.likes ?? raw.stats?.likes ?? 0,
    comments: raw.comments ?? raw.stats?.comments ?? 0,
    isLiked: raw.liked ?? raw.isLiked ?? false,
    createdAt,
  };
}

export default function Feed({
  posts: initialPosts = [],
  filterGroupId: externalFilter,
  groups = [],
  canPost = true,
}) {
  const groupLookup = useMemo(
    () =>
      new Map(
        groups.map((g) => [
          g.id,
          { id: g.id, name: g.name, avatar: g.avatar },
        ])
      ),
    [groups]
  );

  const [posts, setPosts] = useState(() =>
    initialPosts.map((p) => toPostShape(p, groupLookup))
  );
  useEffect(() => {
    setPosts(initialPosts.map((p) => toPostShape(p, groupLookup)));
  }, [initialPosts, groupLookup]);

  const activeGroupId = externalFilter || "all";

  const filteredPosts = useMemo(() => {
    if (activeGroupId === "all") return posts;
    return posts.filter(
      (p) => p.user.id === activeGroupId || p.groupId === activeGroupId
    );
  }, [posts, activeGroupId]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredPosts]);

  const handlePostCreated = (newPost) => {
    const activeGroup =
      groupLookup.get(activeGroupId) || groupLookup.values().next().value;
    const normalized = toPostShape(
      {
        ...newPost,
        group: activeGroup,
        createdAt: new Date().toISOString(),
      },
      groupLookup
    );
    setPosts((prev) => [normalized, ...prev]);
  };

  return (
    <main className="space-y-4">
      {canPost && <CreatePostInput onPostCreated={handlePostCreated} />}

      <div className="space-y-3">
        {sortedPosts.length === 0 && (
          <div className="text-sm text-slate-500">
            Chua co bai dang nao.
          </div>
        )}

        {sortedPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
