"use client";

import { Bell, CheckCheck, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useManagerNotifications } from "@/hooks/useManagerNotifications";
import NotificationList from "@/components/user/NotificationList";

export default function ManagerNotificationsPage() {
  const {
    notifications,
    loading,
    currentPage,
    totalPages,
    totalElements,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    changePage,
  } = useManagerNotifications();

  const handleDeleteAll = async () => {
    if (confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
      await deleteAllNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-emerald-600" />
              Thông báo
            </h1>
            <p className="text-slate-500 mt-2">
              Theo dõi quyết định, nhắc việc và sự kiện quan trọng
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={loading || notifications.length === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={loading || notifications.length === 0}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tất cả
            </Button>
          </div>
        </div>

        {/* Notifications Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Danh sách thông báo
              </CardTitle>
              {totalElements > 0 && (
                <p className="text-sm text-slate-500">
                  Tổng: <span className="font-semibold text-slate-700">{totalElements}</span> thông báo
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Bell className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">Không có thông báo nào</p>
                <p className="text-sm mt-1">Bạn đã xem hết các thông báo</p>
              </div>
            ) : (
              <>
                <NotificationList
                  notifications={notifications}
                  loading={loading}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
                
                {/* PAGINATION */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/30">
                  <div className="text-sm text-slate-600">
                    Trang <span className="font-semibold">{currentPage + 1}</span> / <span className="font-semibold">{totalPages}</span>
                    <span className="ml-2 text-slate-400">
                      (Hiển thị {notifications.length} / {totalElements} thông báo)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 0 || loading}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || loading}
                      className="gap-1"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
