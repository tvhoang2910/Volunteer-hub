"use client"

import {
  BellRing,
  ShieldCheck,
  CalendarClock,
  CalendarPlus,
  UsersRound,
  PartyPopper,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useManagerNotifications } from "@/hooks/useManagerNotifications";
import NotificationCard from "@/components/manager/notifications/NotificationCard";

export default function ManagerNotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead } = useManagerNotifications();

  if (loading) {
    return <div className="p-10 text-center">Đang tải thông báo...</div>;
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


