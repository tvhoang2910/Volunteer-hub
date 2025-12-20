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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useManagerNotifications } from "@/hooks/useManagerNotifications";
import NotificationCard from "@/components/manager/notifications/NotificationCard";

export default function ManagerNotificationsPage() {
  const { 
    notifications, 
    loading, 
    currentPage, 
    totalPages, 
    totalElements,
    markAsRead, 
    markAllAsRead,
    changePage 
  } = useManagerNotifications();

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 text-base font-semibold">
                Danh sách thông báo
              </CardTitle>
              {totalElements > 0 && (
                <p className="text-sm text-slate-500">
                  Tổng: <span className="font-semibold text-slate-700">{totalElements}</span> thông báo
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BellRing className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">Chưa có thông báo nào</p>
                <p className="text-sm mt-1">Thông báo mới sẽ xuất hiện tại đây khi có tình nguyện viên đăng ký sự kiện</p>
              </div>
            ) : (
              <>
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
                
                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      Trang <span className="font-semibold">{currentPage + 1}</span> / <span className="font-semibold">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="gap-1"
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


