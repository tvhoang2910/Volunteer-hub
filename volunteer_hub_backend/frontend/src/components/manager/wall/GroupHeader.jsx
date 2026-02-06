"use client";

import React from "react";

export default function GroupHeader({
  group,
  isMember,
  isManager,
  onToggleJoin,
  onOpenComposer,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="h-36 bg-slate-200 w-full relative">
        {group.banner && (
          <img
            src={group.banner}
            alt="banner"
            className="w-full h-36 object-cover"
          />
        )}

        {/* Info */}
        <div className="absolute -bottom-12 left-6 flex items-end gap-5">
          <div className="flex flex-col justify-end mt-4">
            <div className="text-lg font-semibold text-slate-800 leading-tight">
              {group.name}
            </div>
            <div className="text-sm text-slate-500 mt-1">{group.status}</div>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="p-4 pt-14 flex items-center justify-between gap-4">
        <div>
            Nhóm riêng tư
        </div>
        <div>
            {/* Hiển thị số lượng thành viên */}
            <span className="font-medium">{group.memberCount}</span>
            <span className="text-sm text-slate-500"> thành viên</span>
        </div>
        <div className="text-sm text-slate-700">
          Ngày tạo sự kiện:{" "}
          <span className="font-medium">{group.eventDate}</span>
        </div>
      </div>
    </div>
  );
}
