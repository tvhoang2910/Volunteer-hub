"use client";

import React from "react";

export default function LeftSidebarGroups({ groups, selectedGroupId, onSelect }) {
  return (
    <aside className="hidden lg:block w-[280px] space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Nhóm quản lý</h3>
        <ul className="space-y-3">
          {groups.map((g) => (
            <li
              key={g.id}
              onClick={() => onSelect && onSelect(g.id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 ${
                selectedGroupId === g.id ? "ring-2 ring-indigo-200 bg-indigo-50" : ""
              }`}
            >
              <img src={g.cover} alt="cover" className="h-10 w-10 rounded-md object-cover" />
              <div className="flex-1">
                <div className="text-sm font-medium">{g.name}</div>
                <div className="text-xs text-slate-500">{g.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
