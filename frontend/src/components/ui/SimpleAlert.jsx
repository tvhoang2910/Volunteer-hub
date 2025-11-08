import React, { useEffect } from "react";

export default function SimpleAlert({ type = "info", message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bg = type === "success" ? "bg-green-100 text-green-900" : type === "error" ? "bg-red-100 text-red-900" : "bg-gray-100 text-gray-900";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`rounded-md px-4 py-3 shadow-md ${bg}`} role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <div className="flex-1">{message}</div>
          <button onClick={() => onClose && onClose()} className="font-semibold">Đóng</button>
        </div>
      </div>
    </div>
  );
}
