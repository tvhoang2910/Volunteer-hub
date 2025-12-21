'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  User,
  Loader2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export function AdminRoleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAdminRoleRequests('PENDING');
      const data = response.data || response || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách yêu cầu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDialog = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setNote('');
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest.id);
    setDialogOpen(false);
    
    try {
      if (action === 'approve') {
        await adminService.approveAdminRoleRequest(selectedRequest.id, note || undefined);
        toast({
          title: 'Thành công',
          description: `Đã phê duyệt yêu cầu của ${selectedRequest.name || selectedRequest.email}`,
        });
      } else {
        await adminService.rejectAdminRoleRequest(selectedRequest.id, note || undefined);
        toast({
          title: 'Đã từ chối',
          description: `Đã từ chối yêu cầu của ${selectedRequest.name || selectedRequest.email}`,
        });
      }
      
      // Refresh list
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xử lý yêu cầu',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            Yêu cầu quyền Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            Yêu cầu quyền Admin
            {requests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Không có yêu cầu nào đang chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {request.name || 'Người dùng'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Chờ duyệt
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => openDialog(request, 'approve')}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Duyệt
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => openDialog(request, 'reject')}
                      disabled={processingId === request.id}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Phê duyệt yêu cầu Admin' : 'Từ chối yêu cầu Admin'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? `Bạn có chắc muốn cấp quyền Admin cho ${selectedRequest?.name || selectedRequest?.email}?`
                : `Bạn có chắc muốn từ chối yêu cầu của ${selectedRequest?.name || selectedRequest?.email}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ghi chú (không bắt buộc)
            </label>
            <Textarea
              placeholder="Nhập ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleConfirm}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminRoleRequests;
