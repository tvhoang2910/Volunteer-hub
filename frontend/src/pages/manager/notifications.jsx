"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// =========================
// STATUS TONES
// =========================
const STATUS_TONES = {
  approved: { label: "Đã duyệt", badge: "border-emerald-100 bg-emerald-50 text-emerald-700", icon: "bg-emerald-100 text-emerald-600" },
  removed: { label: "Bị gỡ", badge: "border-rose-100 bg-rose-50 text-rose-700", icon: "bg-rose-100 text-rose-600" },
  success: { label: "Thành công", badge: "border-sky-100 bg-sky-50 text-sky-700", icon: "bg-sky-100 text-sky-600" },
  pending: { label: "Chờ duyệt", badge: "border-amber-100 bg-amber-50 text-amber-700", icon: "bg-amber-100 text-amber-600" },
  warning: { label: "Nhắc nhở", badge: "border-orange-100 bg-orange-50 text-orange-700", icon: "bg-orange-100 text-orange-600" },
  upcoming: { label: "Sắp diễn ra", badge: "border-indigo-100 bg-indigo-50 text-indigo-700", icon: "bg-indigo-100 text-indigo-600" },
  completed: { label: "Đã kết thúc", badge: "border-slate-200 bg-slate-50 text-slate-700", icon: "bg-slate-200 text-slate-600" },
  default: { label: "Thông tin", badge: "border-slate-200 bg-white text-slate-700", icon: "bg-slate-100 text-slate-600" },
}

// =========================
// NOTIFICATION CARD
// =========================
const NotificationCard = ({ icon: Icon, notification, onMarkRead }) => {
  const tone = STATUS_TONES[notification.status] ?? STATUS_TONES.default

  return (
    <div
      onClick={() => onMarkRead(notification.id)}
      className={`relative cursor-pointer rounded-xl border transition-all duration-200 hover:shadow-md ${
        notification.unread
          ? "border-emerald-100 bg-emerald-50/70"
          : "border-slate-100 bg-white/70 opacity-90"
      } p-4`}
    >
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              className={`text-sm ${
                notification.unread ? "font-semibold text-slate-900" : "font-medium text-slate-700"
              }`}
            >
              {notification.title}
            </h3>
            <Badge className={`${tone.badge} text-[11px]`}>{tone.label}</Badge>
          </div>

          <p
            className={`mt-1 text-sm ${
              notification.unread ? "text-slate-700" : "text-slate-500"
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
            {notification.unread && <span className="font-semibold text-emerald-600">• Mới</span>}
          </div>

          {notification.actions?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.actions.map((a) => (
                <Button key={a.label} asChild size="sm" variant={a.primary ? "default" : "outline"}>
                  <Link href={a.href}>{a.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =========================
// MAIN PAGE
// =========================
export default function ManagerNotificationsPage() {
  const MANAGER_ID = "manager-demo-001"
  const STORAGE_KEY = `notif_read_${MANAGER_ID}`

  const seed = useMemo(() => [
    { id: "1", title: 'Dự án "Trồng cây ven sông" đã được duyệt', body: "Admin Lê Thu Hà đã duyệt bản kế hoạch cập nhật.", time: "2 giờ trước", status: "approved" },
    { id: "2", title: 'Dự án "Không đồng hành một mình" bị gỡ', body: "Thiếu báo cáo ngân sách tháng 10. Nộp bổ sung trước 12/11.", time: "5 giờ trước", status: "removed", requiresAction: true, sla: "12h" },
    { id: "3", title: 'Tạo sự kiện "Tập huấn sơ cứu" thành công', body: "Lịch gửi email tuyển tình nguyện viên đã mở.", time: "Hôm nay, 09:15", status: "success" },
    { id: "4", title: "Thành viên mới xin tham gia dự án", body: "Trần Đức Long muốn tham gia dự án “Bếp ấm đêm đông”.", time: "10 phút trước", status: "pending", requiresAction: true, sla: "6h" },
    { id: "5", title: 'Nhắc lịch: "Phiên chợ 0 đồng" sáng mai', body: "Kiểm tra lại danh sách quà tặng và phân công nhóm hậu cần.", time: "Ngày mai • 06:00", status: "warning", requiresAction: true },
    { id: "6", title: 'Sự kiện "Dọn rác Hồ Tây" sắp diễn ra', body: "Cần chốt phương án vận chuyển dụng cụ.", time: "12/11/2025 • 07:30", status: "upcoming", requiresAction: true },
    { id: "7", title: 'Sự kiện "Dạy STEM cho trẻ" đã kết thúc', body: "Hoàn thiện báo cáo trong 3 ngày để nhận ngân sách đợt tiếp.", time: "08/11/2025 • 18:00", status: "completed" },
    { id: "8", title: "Nhắc nhở nộp biên bản họp tháng", body: "Hạn nộp 17:00 hôm nay.", time: "1 giờ trước", status: "warning", requiresAction: true, sla: "6h" },
    { id: "9", title: "Checklist hậu cần đã đạt 80%", body: "Cần bổ sung phương án dự phòng thời tiết.", time: "Hôm qua, 20:45", status: "success" },
  ], [])

  // ⚙️ Bước 1: render giống server (tránh hydration mismatch)
  const [notifications, setNotifications] = useState(() =>
    seed.map((n) => ({ ...n, unread: true }))
  )

  // ⚙️ Bước 2: sau khi mount thì đồng bộ localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      const readSet = new Set(stored)
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: !readSet.has(n.id) }))
      )
    } catch (e) {
      console.warn("localStorage error:", e)
    }
  }, [])

  // ⚙️ Logic đánh dấu đọc
  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      if (!stored.includes(id)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, id]))
      }
    } catch {}
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    try {
      const allIds = notifications.map((n) => n.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER */}
        <header className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <BellRing className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Bảng thông báo
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Quản lý thông báo</h1>
              <p className="text-sm text-slate-500 mt-1">
                Theo dõi quyết định, nhắc việc và sự kiện quan trọng.
              </p>
            </div>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </header>

        {/* LIST */}
        <Card className="border border-slate-200/70 bg-white/90">
          <CardHeader>
            <CardTitle className="text-slate-700 text-base font-semibold">
              Danh sách thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                icon={
                  n.status === "approved" ? ShieldCheck :
                  n.status === "removed" ? AlertTriangle :
                  n.status === "success" ? CalendarPlus :
                  n.status === "pending" ? UsersRound :
                  n.status === "warning" ? AlertTriangle :
                  n.status === "upcoming" ? CalendarClock :
                  n.status === "completed" ? PartyPopper :
                  CheckCircle2
                }
                notification={n}
                onMarkRead={markAsRead}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
