import React, { useState } from 'react';
import { mockUsers } from '@/data/mockUsers';
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
    Eye,
    Lock,
    Unlock,
    ShieldAlert,
    History
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const getRoleBadge = (role) => {
    return role === 'EVENT_MANAGER'
        ? <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none whitespace-nowrap">Event Manager</Badge>
        : <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none whitespace-nowrap">Volunteer</Badge>;
};

const getStatusBadge = (status) => {
    return status === 'ACTIVE'
        ? <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none whitespace-nowrap">Hoạt động</Badge>
        : <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none whitespace-nowrap">Bị khóa</Badge>;
};

// --- Sub-components for Responsive Views ---

const UserCardMobile = ({ user, onLock, onUnlock, onView }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg">
                    {user.fullName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
            </div>
            <div>{getStatusBadge(user.status)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 py-2 border-t border-b border-gray-50">
            <div>
                <span className="text-gray-400 text-xs block">Vai trò</span>
                {getRoleBadge(user.role)}
            </div>
            <div>
                <span className="text-gray-400 text-xs block">Sự kiện</span>
                <span className="font-medium">{user.totalEvents}</span>
            </div>
        </div>

        <div className="flex gap-2 mt-1">
            {user.status === 'ACTIVE' ? (
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onLock(user)}
                >
                    <Lock className="h-4 w-4 mr-2" /> Khóa
                </Button>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => onUnlock(user)}
                >
                    <Unlock className="h-4 w-4 mr-2" /> Mở khóa
                </Button>
            )}
            <Button
                size="sm"
                variant="outline"
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => onView(user)}
            >
                <Eye className="h-4 w-4 mr-2" /> Xem
            </Button>
        </div>
    </div>
);

const UserTableTablet = ({ users, onLock, onUnlock, onView }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50/50">
                    <TableHead>User</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map(user => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50">
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                                        {user.fullName.charAt(0)}
                                    </div>
                                    <div className="max-w-[120px]">
                                        <p className="font-medium text-gray-900 truncate text-sm">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    {user.status === 'ACTIVE' ? (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onLock(user)}>
                                            <Lock className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50" onClick={() => onUnlock(user)}>
                                            <Unlock className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={() => onView(user)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                            Không tìm thấy thành viên.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

const UserTableDesktop = ({ users, onLock, onUnlock, onView }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50/50">
                    <TableHead>User Profile</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-center">Sự kiện</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map(user => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                        {user.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 cursor-pointer hover:underline" onClick={() => onView(user)}>
                                            {user.fullName}
                                        </p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell className="text-sm text-gray-500">{user.joinedAt}</TableCell>
                            <TableCell className="text-center font-medium">{user.totalEvents}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {user.status === 'ACTIVE' ? (
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onLock(user)} title="Khóa">
                                            <Lock className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-700 hover:bg-green-50" onClick={() => onUnlock(user)} title="Mở khóa">
                                            <Unlock className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600" onClick={() => onView(user)} title="Xem chi tiết">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                            Không tìm thấy thành viên nào.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

const UserManagement = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLockOpen, setIsLockOpen] = useState(false);
    const [isUnlockOpen, setIsUnlockOpen] = useState(false);
    const [lockReason, setLockReason] = useState('');

    // Filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Actions
    const handleLockTrigger = (user) => {
        setSelectedUser(user);
        setIsLockOpen(true);
    };

    const handleUnlockTrigger = (user) => {
        setSelectedUser(user);
        setIsUnlockOpen(true);
    };

    const handleLock = () => {
        if (!selectedUser) return;
        setUsers(users.map(u =>
            u.id === selectedUser.id
                ? { ...u, status: 'LOCKED', lockHistory: [...(u.lockHistory || []), { date: new Date().toISOString(), reason: lockReason }] }
                : u
        ));
        toast({
            title: "Đã khóa",
            description: "Đã khóa tài khoản người dùng thành công",
            variant: "destructive"
        });
        setIsLockOpen(false);
        setLockReason('');
        setSelectedUser(null);
    };

    const handleUnlock = () => {
        if (!selectedUser) return;
        setUsers(users.map(u =>
            u.id === selectedUser.id ? { ...u, status: 'ACTIVE' } : u
        ));
        toast({
            title: "Đã mở khóa",
            description: "Đã mở khóa tài khoản thành công",
            className: "bg-green-500 text-white"
        });
        setIsUnlockOpen(false);
        setSelectedUser(null);
    };

    const openDetail = (user) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-sm md:text-base text-gray-500">Quản lý tài khoản tình nguyện viên và nhà tổ chức</p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Tìm tên, email..."
                            className="pl-9 w-full sm:w-[200px] bg-white h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 sm:flex-initial h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="VOLUNTEER">Tình nguyện viên</option>
                            <option value="EVENT_MANAGER">Quản lý</option>
                        </select>
                        <select
                            className="flex-1 sm:flex-initial h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="LOCKED">Bị khóa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Views */}

            {/* Mobile View (< 768px) */}
            <div className="block md:hidden space-y-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <UserCardMobile
                            key={user.id}
                            user={user}
                            onLock={handleLockTrigger}
                            onUnlock={handleUnlockTrigger}
                            onView={openDetail}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">Không tìm thấy thành viên nào.</div>
                )}
            </div>

            {/* Tablet View (768px - 1024px) */}
            <div className="hidden md:block lg:hidden">
                <UserTableTablet
                    users={filteredUsers}
                    onLock={handleLockTrigger}
                    onUnlock={handleUnlockTrigger}
                    onView={openDetail}
                />
            </div>

            {/* Desktop View (>= 1024px) */}
            <div className="hidden lg:block">
                <UserTableDesktop
                    users={filteredUsers}
                    onLock={handleLockTrigger}
                    onUnlock={handleUnlockTrigger}
                    onView={openDetail}
                />
            </div>


            {/* Lock Modal */}
            <Dialog open={isLockOpen} onOpenChange={setIsLockOpen}>
                <DialogContent className="sm:max-w-md w-[95vw]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Khóa tài khoản?
                        </DialogTitle>
                        <DialogDescription>
                            Người dùng sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Nhập lý do khóa (Vi phạm quy định, spam...)"
                            value={lockReason}
                            onChange={(e) => setLockReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsLockOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleLock} disabled={!lockReason.trim()}>
                            Xác nhận Khóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unlock Modal */}
            <Dialog open={isUnlockOpen} onOpenChange={setIsUnlockOpen}>
                <DialogContent className="sm:max-w-md w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Mở khóa tài khoản</DialogTitle>
                        <DialogDescription>
                            Khôi phục quyền truy cập cho người dùng này?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsUnlockOpen(false)}>Hủy</Button>
                        <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleUnlock}>
                            Mở khóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Hồ sơ người dùng</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mb-3">
                                    {selectedUser.fullName.charAt(0)}
                                </div>
                                <h3 className="font-bold text-lg text-center">{selectedUser.fullName}</h3>
                                <p className="text-gray-500 text-sm mb-2 text-center break-all">{selectedUser.email}</p>
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    {getRoleBadge(selectedUser.role)}
                                    {getStatusBadge(selectedUser.status)}
                                </div>
                                <div className="w-full border-t pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ngày tham gia:</span>
                                        <span className="font-medium">{selectedUser.joinedAt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ID:</span>
                                        <span className="font-mono text-xs text-gray-400">{selectedUser.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">Thống kê hoạt động</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-blue-700">{selectedUser.totalEvents}</div>
                                        <div className="text-xs text-blue-600">Sự kiện tham gia</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-green-700">{selectedUser.totalPosts}</div>
                                        <div className="text-xs text-green-600">Bài viết</div>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-purple-700">{selectedUser.totalComments}</div>
                                        <div className="text-xs text-purple-600">Bình luận</div>
                                    </div>
                                </div>

                                {selectedUser.lockHistory && selectedUser.lockHistory.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-red-700 text-sm mb-2 flex items-center gap-1">
                                            <History className="h-3 w-3" /> Lịch sử vi phạm/khóa
                                        </h4>
                                        <div className="bg-red-50 p-3 rounded border border-red-100 text-xs space-y-2 max-h-[100px] overflow-y-auto">
                                            {selectedUser.lockHistory.map((h, idx) => (
                                                <div key={idx} className="border-b border-red-200 last:border-0 pb-1 last:pb-0">
                                                    <span className="font-bold">{h.date.split('T')[0]}:</span> {h.reason}
                                                </div>
                                            ))}
                                        </div>
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

        </div>
    );
};

export default UserManagement;
