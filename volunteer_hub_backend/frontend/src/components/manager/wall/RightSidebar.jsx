"use client";

import React from "react";

export default function RightSidebar({ notifications = [], topGroups = [] }) {
  return (
    <aside className="w-full lg:w-[320px] space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Thông báo nhanh</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {notifications.length === 0 && <li className="text-slate-500">Không có thông báo</li>}
          {notifications.map((n, idx) => (
            <li key={idx} className="py-2 border-b last:border-b-0">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-slate-500">{n.subtitle}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Top nhóm hoạt động</h3>
        <ol className="space-y-2 text-sm">
          {topGroups.length === 0 && <li className="text-slate-500">Chưa có dữ liệu</li>}
          {topGroups.map((g, idx) => (
            <li key={g.id} className="flex items-center gap-3">
              <div className="text-xs text-slate-400">#{idx + 1}</div>
              <img src={g.cover} alt={g.name} className="h-8 w-8 rounded object-cover" />
              <div className="flex-1">
                <div className="text-sm font-medium">{g.name}</div>
                <div className="text-xs text-slate-500">{g.activityCount} hoạt động</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
