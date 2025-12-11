"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import LeftSidebarGroups from "@/components/manager/wall/LeftSidebarGroups";
import Feed from "@/components/manager/wall/Feed";
import RightSidebar from "@/components/manager/wall/RightSidebar";
import GroupHeader from "@/components/manager/wall/GroupHeader";
import GroupInfo from "@/components/manager/wall/GroupInfo";
import PostComposer from "@/components/manager/wall/PostComposer";

export default function GroupWallPage() {
  const router = useRouter();
  const { id } = router.query;

  const groups = useMemo(
    () => [
      {
        id: "g1",
        name: "Trồng cây ven sông",
        cover:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/women/26.jpg",
        banner:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        description:
          "Hành trình trồng cây để bảo vệ bờ sông và tăng mảng xanh khu vực.",
        eventDate: "20/11/2025",
        status: "Đang diễn ra",
        memberCount: 124,
      },
      {
        id: "g2",
        name: "Phiên chợ 0 đồng",
        cover:
          "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
        banner:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        description: "Phiên chợ trao tặng đồ dùng cho người khó khăn.",
        eventDate: "05/10/2025",
        status: "Đã kết thúc",
        memberCount: 85,
      },
    ],
    []
  );

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0].id);
  useEffect(() => {
    if (id) setSelectedGroupId(id);
  }, [id]);

  const group = groups.find((g) => g.id === selectedGroupId) || groups[0];
  const [isMember, setIsMember] = useState(true);
  const [isManager] = useState(false);

  const [posts, setPosts] = useState([
    {
      id: "p1",
      group: { id: "g1", name: "Trồng cây ven sông", avatar: groups[0].avatar },
      author: "Nguyễn Hoài An",
      time: "15 phút trước",
      createdAt: "2025-11-12T00:50:00.000Z",
      lastCommentAt: "2025-11-12T01:05:00.000Z",
      content:
        "Admin đã duyệt bổ sung kinh phí, nhóm có thể đặt thêm 40 cây sao đen 🌱. Cần 6 TNV phụ trách vận chuyển vào sáng thứ 7!",
      media:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
      tags: ["moitruong", "volunteer"],
      stats: { likes: 58, comments: 14 },
    },
    {
      id: "p2",
      group: { id: "g2", name: "Phiên chợ 0 đồng", avatar: groups[1].avatar },
      author: "Lưu Gia Khánh",
      time: "1 giờ trước",
      createdAt: "2025-11-11T23:55:00.000Z",
      lastCommentAt: "2025-11-12T00:10:00.000Z",
      content:
        "Checklist mới cho phiên chợ đã cập nhật lên drive. Mọi người kiểm tra lại bàn giao vật phẩm, nhóm quần áo trẻ em lưu ý!",
      tags: ["phiencho", "checklist"],
      stats: { likes: 35, comments: 9 },
    },
  ]);

  function handleCreatePost(newPost) {
    const now = new Date().toISOString();
    const p = {
      ...newPost,
      group: { id: group.id, name: group.name, avatar: group.avatar },
      createdAt: newPost?.createdAt ?? now,
      lastCommentAt: newPost?.lastCommentAt ?? now,
    };
    setPosts((prev) => [p, ...prev]);
  }

  function handleToggleJoin() {
    setIsMember((m) => !m);
  }

  /** 🎨 Giao diện chính */
  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 lg:px-8">
      <div className="mx-auto max-w-[1300px] grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* 🧭 SIDEBAR TRÁI */}
        <aside>
          <LeftSidebarGroups
            groups={groups}
            selectedGroupId={group.id}
            onSelect={(gId) => router.push(`/manager/group/${gId}`)}
          />
        </aside>

        {/* 🏞️ KHU VỰC NỘI DUNG CHÍNH */}
        <section className="space-y-6 w-full">
          {/* Banner + Header nhóm */}
          <GroupHeader
            group={group}
            isMember={isMember}
            isManager={isManager}
            onToggleJoin={handleToggleJoin}
            onOpenComposer={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          />

          {/* Các phần phía dưới rộng bằng banner */}
          <div className="space-y-4">
            <GroupInfo group={group} />

            {isMember || isManager ? (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <PostComposer onCreate={handleCreatePost} />
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-slate-500">
                Bạn cần tham gia sự kiện để đăng bài.
              </div>
            )}

            <Feed posts={posts} filterGroupId={group.id} />
          </div>
        </section>

        {/* 📋 SIDEBAR PHẢI */}
        <aside className="space-y-4">
          <RightSidebar notifications={[]} topGroups={groups} />
        </aside>
      </div>
    </div>
  );
}
