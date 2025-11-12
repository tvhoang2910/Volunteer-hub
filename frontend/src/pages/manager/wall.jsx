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
        name: "Trồng cây ven sông",
        cover:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/women/26.jpg",
        status: "đang diễn ra",
        activityCount: 12,
      },
      {
        id: "g2",
        name: "Phiên chợ 0 đồng",
        cover:
          "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
        status: "đã kết thúc",
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
    ],
    [groups]
  );

  const notifications = useMemo(
    () => [
      { title: "Nhóm Trồng cây ven sông có 5 bài mới", subtitle: "5 bài đăng chưa đọc từ thành viên" },
      { title: "Sự kiện Dạy STEM sắp diễn ra", subtitle: "16/11 • 14:00 — 2 ngày nữa" },
    ],
    []
  );

  const topGroups = useMemo(() => groups.map((g) => ({ ...g, activityCount: g.activityCount })), [groups]);

  return (
    <div className="min-h-screen bg-slate-50 px-2 py-6 lg:px-8">
      <div className="mx-auto max-w-[1300px] grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="sticky top-6 space-y-5 h-fit">
          <LeftSidebarGroups groups={groups} selectedGroupId={selectedGroupId} onSelect={setSelectedGroupId} />
        </aside>

        <section className="min-h-full overflow-y-auto pr-2 space-y-5 pb-0">
          {/* Composer area could be re-used; simplified here */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-slate-600">Bạn đang xem dưới tư cách: <span className="font-medium">Quản trị viên</span></div>
          </div>

          <Feed posts={posts} filterGroupId={selectedGroupId} />
        </section>

        <aside className="sticky top-6 space-y-5 h-fit">
          <RightSidebar notifications={notifications} topGroups={topGroups} />
        </aside>
      </div>
    </div>
  );
}
