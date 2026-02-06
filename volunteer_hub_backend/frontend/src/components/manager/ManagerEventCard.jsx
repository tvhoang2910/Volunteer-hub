import { CalendarDays, MapPin } from "lucide-react";

const toneClasses = {
  managed: "bg-[#DFFFF0]",
  pending: "bg-[#FFF7D9]",
};

const getDateParts = (range = "") =>
  range.split(" - ").map((value) => value?.trim()).filter(Boolean);

export default function ManagerEventCard({
  event,
  tone = "managed",
  onCardClick,
  actions = [],
  statusMessage,
}) {
  const [start, end] = getDateParts(event?.date || "");
  const isClickable = Boolean(onCardClick);

  return (
    <div
      className={`${toneClasses[tone] || toneClasses.managed} rounded-3xl p-4 shadow-lg border border-white/60 flex flex-col gap-4 transition hover:shadow-xl`}
    >
      {statusMessage && (
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-100/80 border border-amber-200 rounded-full px-3 py-1 w-fit">
          {statusMessage}
        </div>
      )}
      <div
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onClick={onCardClick}
        onKeyDown={(e) => {
          if (!onCardClick) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardClick();
          }
        }}
        className={`flex flex-col gap-4 outline-none ${
          isClickable ? "cursor-pointer" : ""
        }`}
      >
        <img
          src={
            event?.img ||
            event?.image ||
            "https://cdn.shadcnstudio.com/ss-assets/components/card/image-11.png"
          }
          alt={event?.title || "Event cover"}
          className="h-48 w-full rounded-2xl object-cover"
        />

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[#1B1F3B]">
            {event?.title || "Chưa có tiêu đề"}
          </h3>
          <p className="flex items-center gap-2 text-[#4C566A] text-sm">
            <MapPin className="h-4 w-4" />
            {event?.location || "Đang cập nhật địa điểm"}
          </p>
          <p className="flex items-center gap-2 text-[#4C566A] text-sm">
            <CalendarDays className="h-4 w-4" />
            {start && end ? `${start} - ${end}` : "Chưa có thời gian"}
          </p>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 border-t border-white/70 pt-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick && action.onClick();
                }}
                className={`flex items-center gap-1 text-sm font-semibold transition hover:opacity-80 ${action.className}`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
