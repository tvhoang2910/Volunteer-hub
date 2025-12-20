"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import LeftSidebarGroups from "@/components/manager/wall/LeftSidebarGroups";
import Feed from "@/components/manager/wall/Feed";
import RightSidebar from "@/components/manager/wall/RightSidebar";
import GroupHeader from "@/components/manager/wall/GroupHeader";
import GroupInfo from "@/components/manager/wall/GroupInfo";

export default function GroupWallPage() {
  const router = useRouter();
  const { id } = router.query;

  const groups = useMemo(
    () => [
      {
        id: "g1",
        name: "Trong cay ven song",
        cover:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/women/26.jpg",
        banner:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        description:
          "Chuong trinh trong cay bao ve bo song va tao them mang xanh khu vuc.",
        eventDate: "20/11/2025",
        status: "Dang dien ra",
        memberCount: 124,
      },
      {
        id: "g2",
        name: "Phien cho 0 dong",
        cover:
          "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
        banner:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        description: "Phien cho trao tang vat pham thiet yeu cho nguoi kho khan.",
        eventDate: "05/10/2025",
        status: "Da ket thuc",
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

  const [posts] = useState([
    {
      id: "p1",
      group: { id: "g1", name: "Trồng cây ven sông", avatar: groups[0].avatar },
      author: "Nguyễn Hoài An",
      time: "15 phút trước",
      createdAt: "2025-11-12T00:50:00.000Z",
      lastCommentAt: "2025-11-12T01:05:00.000Z",
      content:
        "Admin vua duyet bo sung kinh phi de mo rong khu vuc trong them 40 cay sao den. Can 6 TNV phu trach van chuyen vao sang thu 7!",
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
        "Checklist moi cho phien cho da cap nhat len drive. Moi nguoi kiem tra lai ban giao vat pham, nho quan ao tre em luu y!",
      tags: ["phiencho", "checklist"],
      stats: { likes: 35, comments: 9 },
    },
  ]);

  function handleToggleJoin() {
    setIsMember((m) => !m);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 lg:px-8">
      <div className="mx-auto max-w-[1300px] grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside>
          <LeftSidebarGroups
            groups={groups}
            selectedGroupId={group.id}
            onSelect={(gId) => router.push(`/manager/group/${gId}`)}
          />
        </aside>

        <section className="space-y-6 w-full">
          <GroupHeader
            group={group}
            isMember={isMember}
            isManager={isManager}
            onToggleJoin={handleToggleJoin}
            onOpenComposer={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          />

          <div className="space-y-4">
            <GroupInfo group={group} />

            {isMember || isManager ? (
              <Feed
                posts={posts}
                filterGroupId={group.id}
                groups={groups}
                canPost
              />
            ) : (
              <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-slate-500">
                Ban can tham gia su kien de xem va dang bai.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <RightSidebar notifications={[]} topGroups={groups} />
        </aside>
      </div>
    </div>
  );
}
