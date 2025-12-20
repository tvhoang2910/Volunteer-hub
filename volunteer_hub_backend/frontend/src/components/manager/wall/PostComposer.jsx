"use client";

import React, { useState, useRef } from "react";

export default function PostComposer({ onCreate }) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const taRef = useRef(null);

  function handleSubmit() {
    if (!text.trim()) return;
    onCreate && onCreate({ id: Date.now().toString(), content: text, media: null, stats: { likes: 0, comments: 0 }, author: "Bạn", time: "vừa xong" });
    setText("");
    setExpanded(false);
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      {!expanded ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setExpanded(true); setTimeout(() => taRef.current?.focus(), 50); }}
          className="border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-500 cursor-text hover:bg-slate-50"
        >
          Bạn muốn chia sẻ điều gì với nhóm này?
        </div>
      ) : (
        <div>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Chia sẻ tin tức, hình ảnh hoặc hỏi ý kiến..."
            className="w-full min-h-[100px] resize-none p-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <button type="button" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100">
                <span>📷</span>
                <span className="text-xs">Ảnh</span>
              </button>
              <button type="button" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100">
                <span>😊</span>
                <span className="text-xs">Emoji</span>
              </button>
              <button type="button" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100">
                <span>🏷️</span>
                <span className="text-xs">Gắn</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => { setExpanded(false); setText(""); }} className="text-sm text-slate-500 px-3 py-1 rounded hover:bg-slate-50">Hủy</button>
              <button onClick={handleSubmit} className="px-4 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium">Đăng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
