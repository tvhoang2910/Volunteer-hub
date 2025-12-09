import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { mockEvents } from '@/data/mockEvents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Status Badge Helper
const getStatusBadge = (status) => {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-green-500 hover:bg-green-600">Đã duyệt</Badge>;
    case 'PENDING':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Chờ duyệt</Badge>;
    case 'REJECTED':
      return <Badge variant="destructive">Từ chối</Badge>;
    case 'DELETED':
      return <Badge variant="outline" className="text-gray-500 border-gray-500">Đã xóa</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const EventManagement = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Filter Logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleApprove = () => {
    if (!selectedEvent) return;

    // Simulate API call
    setTimeout(() => {
      setEvents(events.map(ev =>
        ev.id === selectedEvent.id ? { ...ev, status: 'APPROVED' } : ev
      ));
      toast({
        title: "Thành công",
        description: "Duyệt sự kiện thành công",
        className: "bg-green-500 text-white border-none"
      });
      setIsConfirmApproveOpen(false);
      setSelectedEvent(null);
    }, 500);
  };

  const handleReject = () => {
    if (!selectedEvent) return;

    // Simulate API call
    setTimeout(() => {
      setEvents(events.map(ev =>
        ev.id === selectedEvent.id ? { ...ev, status: 'REJECTED', notes: rejectReason } : ev
      ));
      toast({
        title: "Đã từ chối",
        description: "Đã từ chối sự kiện và lưu ghi chú",
        variant: "destructive"
      });
      setIsRejectOpen(false);
      setRejectReason('');
      setSelectedEvent(null);
    }, 500);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;

    // Simulate API call
    setTimeout(() => {
      // Soft delete
      setEvents(events.map(ev =>
        ev.id === selectedEvent.id ? { ...ev, status: 'DELETED' } : ev
      ));

      toast({
        title: "Đã xóa",
        description: "Đã xóa sự kiện thành công",
      });
      setIsDeleteOpen(false);
      setSelectedEvent(null);
    }, 500);
  };

  const openDetail = (event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  return (

    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sự kiện</h1>
          <p className="text-gray-500">Kiểm duyệt và quản lý các hoạt động tình nguyện</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiến sự kiện..."
              className="pl-9 w-[250px] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Event List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[300px]">Tên sự kiện</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium">
                    <div>
                      <div
                        className="font-semibold text-gray-900 cursor-pointer hover:text-green-600 transition-colors"
                        onClick={() => openDetail(event)}
                      >
                        {event.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[250px]">{event.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {event.startDate}
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.createdBy}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(event.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {event.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-700"
                            onClick={() => { setSelectedEvent(event); setIsConfirmApproveOpen(true); }}
                            title="Duyệt"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                            onClick={() => { setSelectedEvent(event); setIsRejectOpen(true); }}
                            title="Từ chối"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                        onClick={() => openDetail(event)}
                        title="Chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                        onClick={() => { setSelectedEvent(event); setIsDeleteOpen(true); }}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy sự kiện nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết sự kiện</DialogTitle>
            <DialogDescription>ID: {selectedEvent?.id}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tên sự kiện</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedEvent.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mô tả</h3>
                  <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ngày bắt đầu</h3>
                    <p className="text-sm">{selectedEvent.startDate}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ngày kết thúc</h3>
                    <p className="text-sm">{selectedEvent.endDate || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Địa điểm</h3>
                  <p className="text-sm">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Người tạo</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {selectedEvent.createdBy.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{selectedEvent.createdBy}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Thống kê</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <span className="block text-gray-500 text-xs">Đăng ký</span>
                      <span className="font-bold text-lg">{selectedEvent.volunteerCount}</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="block text-gray-500 text-xs">Chờ duyệt</span>
                      <span className="font-bold text-lg text-yellow-600">{selectedEvent.pendingRegistrations}</span>
                    </div>
                  </div>
                </div>
                {selectedEvent.notes && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h3 className="text-xs font-bold text-yellow-800 uppercase mb-1">Ghi chú Admin</h3>
                    <p className="text-xs text-yellow-800">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirm Modal */}
      <Dialog open={isConfirmApproveOpen} onOpenChange={setIsConfirmApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt sự kiện này?</DialogTitle>
            <DialogDescription>
              Sự kiện sẽ được hiển thị công khai cho các tình nguyện viên.
              Kênh trao đổi sẽ được kích hoạt tự động.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmApproveOpen(false)}>Hủy</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
              Xác nhận Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối sự kiện</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối hoặc yêu cầu chỉnh sửa để gửi đến người tạo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Từ chối sự kiện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Xóa sự kiện?
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Tất cả đăng ký của tình nguyện viên sẽ bị hủy bỏ và thông báo sẽ được gửi đi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>

  );
};

export default EventManagement;