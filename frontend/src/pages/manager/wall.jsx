"use client";

import { useMemo, useState } from "react";
import LeftSidebarGroups from "@/components/manager/wall/LeftSidebarGroups";
import Feed from "@/components/manager/wall/Feed";
import RightSidebar from "@/components/manager/wall/RightSidebar";

export default function ManagerWallPage() {
  const groups = useMemo(
    () => [
      {
        id: "g1",
        name: "Trong cay ven song",
        cover:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/women/26.jpg",
        status: "Dang dien ra",
        activityCount: 12,
      },
      {
        id: "g2",
        name: "Phien cho 0 dong",
        cover:
          "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
        status: "Da ket thuc",
        activityCount: 8,
      },
    ],
    []
  );

  const [selectedGroupId, setSelectedGroupId] = useState("all");

  const posts = useMemo(
    () => [
      {
        id: "p1",
        group: { id: "g1", name: "Trong cay ven song", avatar: groups[0].avatar },
        author: "Nguyen Hoai An",
        time: "15 phut truoc",
        createdAt: "2025-11-12T00:50:00.000Z",
        lastCommentAt: "2025-11-12T01:05:00.000Z",
        content:
          "Admin vua duyet bo sung kinh phi de trong them 40 cay sao den. Can 6 TNV phu trach van chuyen vao sang thu 7!",
        media:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
        tags: ["moitruong", "volunteer"],
        stats: { likes: 58, comments: 14 },
      },
      {
        id: "p2",
        group: { id: "g2", name: "Phien cho 0 dong", avatar: groups[1].avatar },
        author: "Lieu Gia Khanh",
        time: "1 gio truoc",
        createdAt: "2025-11-11T23:55:00.000Z",
        lastCommentAt: "2025-11-12T00:10:00.000Z",
        content:
          "Checklist moi cho phien cho da cap nhat len drive. Moi nguoi kiem tra lai ban giao vat pham, nho quan ao tre em luu y!",
        tags: ["phiencho", "checklist"],
        stats: { likes: 35, comments: 9 },
      },
    ],
    [groups]
  );

  const notifications = useMemo(
    () => [
      { title: "Nhom Trong cay ven song co 5 bai moi", subtitle: "5 bai dang cho duyet tu thanh vien" },
      { title: "Su kien Day STEM sap dien ra", subtitle: "16/11 luc 14:00 - con 2 ngay" },
    ],
    []
  );

  const topGroups = useMemo(
    () => groups.map((g) => ({ ...g, activityCount: g.activityCount })),
    [groups]
  );

  return (
    <div className="min-h-screen bg-slate-50 px-2 py-6 lg:px-8">
      <div className="mx-auto max-w-[1300px] grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="sticky top-6 space-y-5 h-fit">
          <LeftSidebarGroups
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelect={setSelectedGroupId}
          />
        </aside>

        <section className="min-h-full overflow-y-auto pr-2 space-y-5 pb-0">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-slate-600">
              Ban dang xem duoi tu cach: <span className="font-medium">Quan tri vien</span>
            </div>
          </div>

          <Feed
            posts={posts}
            filterGroupId={selectedGroupId}
            groups={groups}
            canPost
          />
        </section>

        <aside className="sticky top-6 space-y-5 h-fit">
          <RightSidebar notifications={notifications} topGroups={topGroups} />
        </aside>
      </div>
    </div>
  );
}
