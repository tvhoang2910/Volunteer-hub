import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SlideUpDetail from "@/components/ui/slide-up";
import BasicPagination from "@/components/ui/pagination";
import { useState } from "react";
import { Eye, Calendar, MapPin, Users, AlertTriangle, Loader, Bell } from "lucide-react";
import { motion } from "framer-motion";

const AnnounceDetail = ({
  notifications,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onMarkRead
}) => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsSlideUpOpen(true);

    // Cập nhật status thành "đã đọc" nếu chưa đọc
    if (notification.status === "Chưa đọc" && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Thông báo khi đang hiển thị dữ liệu demo */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Lưu ý</p>
              <p className="text-sm text-amber-800 mt-1">
                Đang hiển thị dữ liệu demo do API không khả dụng.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Loader className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <p className="text-gray-600 font-medium">Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-0">
            <CardContent>
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">Không có thông báo nào</p>
              <p className="text-gray-400 text-sm mt-2">Bạn sẽ nhận được thông báo khi có sự kiện mới</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        notifications.map((notification, idx) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`mb-4 border-0 cursor-pointer transition-all duration-300 hover:shadow-lg group ${notification.status === 'Chưa đọc'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md'
                : 'bg-white hover:bg-gray-50'
              }`}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold text-gray-900">{notification.title}</CardTitle>
                    <CardDescription className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(notification.date)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={notification.status === 'Đã đọc' ? 'secondary' : 'default'}
                    className={`flex-shrink-0 text-xs font-semibold ${notification.status === 'Chưa đọc'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {notification.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{notification.message}</p>
              </CardContent>
              <CardFooter className="justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(notification)}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium group-hover:translate-x-0.5 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem chi tiết</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))
      )}

      {/* Pagination */}
      {!isLoading && notifications.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center my-8"
        >
          <BasicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </motion.div>
      )}

      {/* Slide-up Detail Modal */}
      <SlideUpDetail
        isOpen={isSlideUpOpen}
        onClose={() => setIsSlideUpOpen(false)}
        title={selectedNotification?.title || ""}
        description="Chi tiết thông báo"
        mainContent=""
      >
        {selectedNotification && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 -mx-6 -mt-6 px-6 py-6 rounded-t-2xl border-b border-emerald-100">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedNotification.date)}
                  </p>
                </div>
                <Badge
                  variant={selectedNotification.status === 'Đã đọc' ? 'secondary' : 'default'}
                  className={`flex-shrink-0 text-sm font-bold ${selectedNotification.status === 'Chưa đọc'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                    }`}
                >
                  {selectedNotification.status}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Nội dung</h4>
                <p className="text-gray-700 leading-relaxed text-base">
                  {selectedNotification.description || selectedNotification.message}
                </p>
              </div>

              {/* Event Details (if available) */}
              {selectedNotification.location && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Thông tin sự kiện</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 border border-gray-100">
                      <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">ĐỊA ĐIỂM</p>
                        <p className="text-gray-900 font-medium">{selectedNotification.location}</p>
                      </div>
                    </div>

                    {selectedNotification.start_time && (
                      <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 border border-gray-100">
                        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">THỜI GIAN</p>
                          <p className="text-gray-900 font-medium text-sm">
                            {formatDate(selectedNotification.start_time).split(' ')[0]}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(selectedNotification.start_time).split(' ')[1]} - {formatDate(selectedNotification.end_time).split(' ')[1]}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedNotification.max_volunteers && (
                      <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 border border-gray-100">
                        <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">NGƯỜI THAM GIA</p>
                          <p className="text-gray-900 font-bold text-lg">
                            {selectedNotification.current_volunteers || 0}/{selectedNotification.max_volunteers}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsSlideUpOpen(false)}
                className="font-semibold"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </SlideUpDetail>
    </div>
  );
};

export default AnnounceDetail;
