import React from "react";

export default function DateTimeInput({ label, dateValue, timeValue, onChange }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="date"
          value={dateValue || ""}
          onChange={(e) => onChange("date", e.target.value)}
          className="flex-1 border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
        />
        <input
          type="time"
          value={timeValue || ""}
          onChange={(e) => onChange("time", e.target.value)}
          className="w-36 border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
        />
      </div>
    </div>
  );
}
