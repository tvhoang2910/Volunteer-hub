"use client";

import React, { useState } from "react";

export default function GroupInfo({ group }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Thông tin nhóm</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">{group.description}</p>
        </div>

        <div className="text-right">
          <button
            onClick={() => setOpen((s) => !s)}
            className="text-xs text-slate-500 hover:text-slate-700"
            aria-expanded={open}
          >
            {open ? "Thu gọn" : "Mở rộng"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="space-y-1">
            <div className="font-medium text-slate-800">Ngày</div>
            <div className="text-xs text-slate-500">{group.eventDate}</div>
          </div>

          <div className="space-y-1">
            <div className="font-medium text-slate-800">Thành viên</div>
            <div className="text-xs text-slate-500">{group.memberCount}</div>
          </div>

          <div className="col-span-2 mt-2">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-block px-2 py-1 rounded bg-slate-100">{group.status}</span>
              <span className="inline-block text-slate-400">•</span>
              <span>Nhóm riêng tư</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
