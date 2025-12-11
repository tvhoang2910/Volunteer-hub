"use client";

import LeftSidebarGroups from "@/components/manager/wall/LeftSidebarGroups";
import Feed from "@/components/manager/wall/Feed";
import RightSidebar from "@/components/manager/wall/RightSidebar";
import { useManagerWall } from "@/hooks/useManagerWall";

export default function ManagerWallPage() {
  const {
    groups,
    posts,
    notifications,
    selectedGroupId,
    setSelectedGroupId,
    topGroups,
    loading,
  } = useManagerWall();

  if (loading) {
    return <div className="p-10 text-center">Đang tải bảng tin...</div>;
  }

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

