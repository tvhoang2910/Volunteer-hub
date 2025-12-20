
import Link from "next/link";
import {
    BellRing,
    Clock3,
    ShieldCheck,
    CalendarClock,
    CalendarPlus,
    UsersRound,
    PartyPopper,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// =========================
// STATUS TONES
// =========================
const STATUS_TONES = {
    approved: {
        label: "Đã duyệt",
        badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
        icon: "bg-emerald-100 text-emerald-600",
    },
    removed: {
        label: "Bị gỡ",
        badge: "border-rose-100 bg-rose-50 text-rose-700",
        icon: "bg-rose-100 text-rose-600",
    },
    success: {
        label: "Thành công",
        badge: "border-sky-100 bg-sky-50 text-sky-700",
        icon: "bg-sky-100 text-sky-600",
    },
    pending: {
        label: "Chờ duyệt",
        badge: "border-amber-100 bg-amber-50 text-amber-700",
        icon: "bg-amber-100 text-amber-600",
    },
    warning: {
        label: "Nhắc nhở",
        badge: "border-orange-100 bg-orange-50 text-orange-700",
        icon: "bg-orange-100 text-orange-600",
    },
    upcoming: {
        label: "Sắp diễn ra",
        badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
        icon: "bg-indigo-100 text-indigo-600",
    },
    completed: {
        label: "Đã kết thúc",
        badge: "border-slate-200 bg-slate-50 text-slate-700",
        icon: "bg-slate-200 text-slate-600",
    },
    default: {
        label: "Thông tin",
        badge: "border-slate-200 bg-white text-slate-700",
        icon: "bg-slate-100 text-slate-600",
    },
};

export default function NotificationCard({ icon: Icon, notification, onMarkRead }) {
    const tone = STATUS_TONES[notification.status] ?? STATUS_TONES.default;
    const DisplayIcon = Icon || BellRing; // Default icon if none provided

    return (
        <div
            onClick={() => onMarkRead(notification.id)}
            className={`relative cursor-pointer rounded-xl border transition-all duration-200 hover:shadow-md ${notification.unread
                    ? "border-emerald-100 bg-emerald-50/70"
                    : "border-slate-100 bg-white/70 opacity-90"
                } p-4`}
        >
            <div className="flex gap-4">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.icon}`}
                >
                    <DisplayIcon className="h-4 w-4" />
                </div>

                <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                            className={`text-sm ${notification.unread
                                    ? "font-semibold text-slate-900"
                                    : "font-medium text-slate-700"
                                }`}
                        >
                            {notification.title}
                        </h3>
                        <Badge className={`${tone.badge} text-[11px]`}>{tone.label}</Badge>
                    </div>

                    <p
                        className={`mt-1 text-sm ${notification.unread ? "text-slate-700" : "text-slate-500"
                            }`}
                    >
                        {notification.body}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Clock3 className="h-3 w-3" /> {notification.time}
                        </span>
                        {notification.requiresAction && (
                            <span className="font-medium text-amber-600">
                                • Cần phản hồi trong {notification.sla || "24h"}
                            </span>
                        )}
                        {notification.unread && (
                            <span className="font-semibold text-emerald-600">• Mới</span>
                        )}
                    </div>

                    {notification.actions?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {notification.actions.map((a) => (
                                <Button
                                    key={a.label}
                                    asChild
                                    size="sm"
                                    variant={a.primary ? "default" : "outline"}
                                >
                                    <Link href={a.href}>{a.label}</Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
