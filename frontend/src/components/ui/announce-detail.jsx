import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SlideUpDetail from "@/components/ui/slide-up";
import BasicPagination from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { Eye, Calendar, MapPin, Users } from "lucide-react";

const AnnounceDetail = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getAllAnnounce = async (page = 1) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?page=${page}&limit=10`;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải danh sách thông báo");
      }

      const data = await response.json();
      setNotifications(data.notifications || data.data || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 10));
    } catch (error) {
      console.error("Lỗi tải danh sách thông báo:", error);
      // Set error để hiển thị banner cảnh báo
      setError(error.message);
      
      // Fallback data nếu API không hoạt động
      const demoNotifications = [
        {
          id: 1,
          title: "Thông báo mẫu",
          date: "2024-01-01",
          message: "Đây là một thông báo mẫu",
          status: "Chưa đọc",
          description: "Chi tiết đầy đủ của thông báo mẫu này sẽ được hiển thị ở đây. Đây là dữ liệu demo khi API không hoạt động.",
          location: "Hà Nội",
          start_time: "2024-01-01T08:00:00Z",
          end_time: "2024-01-01T17:00:00Z",
          max_volunteers: 50,
          current_volunteers: 32
        },
        {
          id: 2,
          title: "Thông báo thứ hai",
          date: "2024-01-02",
          message: "Đây là thông báo mẫu thứ hai",
          status: "Đã đọc",
          description: "Chi tiết của thông báo thứ hai. Dữ liệu này được hiển thị khi API gặp lỗi.",
          location: "TP.HCM",
          start_time: "2024-01-02T09:00:00Z",
          end_time: "2024-01-02T18:00:00Z",
          max_volunteers: 30,
          current_volunteers: 15
        },
        {
          id: 3,
          title: "Thông báo thứ ba",
          date: "2024-01-03",
          message: "Đây là thông báo mẫu thứ ba",
          status: "Chưa đọc",
          description: "Chi tiết của thông báo thứ ba. Dữ liệu này được hiển thị khi API gặp lỗi.",
          location: "Đà Nẵng",
          start_time: "2024-01-03T10:00:00Z",
          end_time: "2024-01-03T19:00:00Z",
          max_volunteers: 25,
          current_volunteers: 8
        },
        {
          id: 4,
          title: "Thông báo thứ tư",
          date: "2024-01-04",
          message: "Đây là thông báo mẫu thứ tư",
          status: "Đã đọc",
          description: "Chi tiết của thông báo thứ tư. Dữ liệu này được hiển thị khi API gặp lỗi.",
          location: "Cần Thơ",
          start_time: "2024-01-04T11:00:00Z",
          end_time: "2024-01-04T20:00:00Z",
          max_volunteers: 40,
          current_volunteers: 22
        },
        {
          id: 5,
          title: "Thông báo thứ năm",
          date: "2024-01-05",
          message: "Đây là thông báo mẫu thứ năm",
          status: "Chưa đọc",
          description: "Chi tiết của thông báo thứ năm. Dữ liệu này được hiển thị khi API gặp lỗi.",
          location: "Hải Phòng",
          start_time: "2024-01-05T12:00:00Z",
          end_time: "2024-01-05T21:00:00Z",
          max_volunteers: 35,
          current_volunteers: 18
        }
      ];
      
      // Simulate pagination for demo data
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedData = demoNotifications.slice(startIndex, endIndex);
      
      setNotifications(paginatedData);
      setTotalPages(Math.ceil(demoNotifications.length / 10));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllAnnounce(currentPage);
  }, [currentPage]);

  const handleViewDetails = async (notification) => {
    setSelectedNotification(notification);
    setIsSlideUpOpen(true);
    
    // Cập nhật status thành "đã đọc" nếu chưa đọc
    if (notification.status === "Chưa đọc") {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${notification.id}/mark-read`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Cập nhật local state
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notification.id 
                ? { ...notif, status: "Đã đọc" }
                : notif
            )
          );
        }
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getAllAnnounce(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="space-y-4">
      {/* Thông báo khi đang hiển thị dữ liệu demo */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Đang hiển thị dữ liệu demo do API không khả dụng.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-6 text-center">
          <CardContent>
            <p className="text-gray-500">Không có thông báo nào</p>
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{notification.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {formatDate(notification.date)}
                  </CardDescription>
                </div>
                <Badge 
                  variant={notification.status === 'Đã đọc' ? 'secondary' : 'default'}
                  className="ml-2"
                >
                  {notification.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 line-clamp-2">{notification.message}</p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails(notification)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      {/* Pagination */}
      {!isLoading && notifications.length > 0 && totalPages > 1 && (
        <div className="flex justify-center my-6">
          <BasicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
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
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedNotification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(selectedNotification.date)}
              </p>
              <Badge 
                variant={selectedNotification.status === 'Đã đọc' ? 'secondary' : 'default'}
                className="mt-2"
              >
                {selectedNotification.status}
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Nội dung:</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedNotification.description || selectedNotification.message}
                </p>
              </div>

              {/* Event Details (if available) */}
              {selectedNotification.location && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedNotification.location}</span>
                  </div>
                  
                  {selectedNotification.start_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {formatDate(selectedNotification.start_time)} - {formatDate(selectedNotification.end_time)}
                      </span>
                    </div>
                  )}

                  {selectedNotification.max_volunteers && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {selectedNotification.current_volunteers || 0}/{selectedNotification.max_volunteers} người tham gia
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsSlideUpOpen(false)}
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