import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { mockEvents } from '@/data/mockEvents';
import { mockUsers } from '@/data/mockUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileDown, Mail, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ExportPanel = () => {
    const { toast } = useToast();
    // Events Export State
    const [eventDateStart, setEventDateStart] = useState('');
    const [eventDateEnd, setEventDateEnd] = useState('');
    const [eventStatus, setEventStatus] = useState('ALL');
    const [eventFormat, setEventFormat] = useState('csv');

    // Users Export State
    const [userRole, setUserRole] = useState('VOLUNTEER');
    const [userStatus, setUserStatus] = useState('ALL');
    const [userFormat, setUserFormat] = useState('csv');

    // Helper: Download
    const downloadFile = (content, fileName, contentType) => {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    // Helper: Convert to CSV
    const toCSV = (data, columns) => {
        const header = columns.map(c => c.header).join(',');
        const rows = data.map(row => columns.map(c => `"${row[c.accessor] || ''}"`).join(',')).join('\n');
        return `${header}\n${rows}`;
    };

    // Export Events Logic
    const handleExportEvents = () => {
        // 1. Filter
        let filtered = mockEvents;
        if (eventStatus !== 'ALL') {
            filtered = filtered.filter(e => e.status === eventStatus);
        }
        if (eventDateStart) {
            filtered = filtered.filter(e => e.startDate >= eventDateStart);
        }
        if (eventDateEnd) {
            filtered = filtered.filter(e => e.startDate <= eventDateEnd);
        }

        if (filtered.length === 0) {
            toast({
                title: "Không có dữ liệu",
                description: "Không có dữ liệu sự kiện nào phù hợp để xuất.",
                variant: "destructive"
            });
            return;
        }

        // 2. Format
        const fileName = `events-export-${new Date().toISOString().slice(0, 10)}.${eventFormat}`;

        if (eventFormat === 'json') {
            downloadFile(JSON.stringify(filtered, null, 2), fileName, 'application/json');
        } else {
            // CSV
            const columns = [
                { header: 'ID', accessor: 'id' },
                { header: 'Tên sự kiện', accessor: 'name' },
                { header: 'Danh mục', accessor: 'category' },
                { header: 'Địa điểm', accessor: 'location' },
                { header: 'Ngày bắt đầu', accessor: 'startDate' },
                { header: 'Người tạo', accessor: 'createdBy' },
                { header: 'Trạng thái', accessor: 'status' },
                { header: 'Số đăng ký', accessor: 'volunteerCount' },
            ];
            downloadFile(toCSV(filtered, columns), fileName, 'text/csv');
        }

        toast({
            title: "Xuất thành công",
            description: `Đã xuất ${filtered.length} sự kiện.`,
            className: "bg-blue-500 text-white"
        });
    };

    // Export Users Logic
    const handleExportUsers = () => {
        // 1. Filter
        let filtered = mockUsers;
        if (userRole !== 'ALL') {
            filtered = filtered.filter(u => u.role === userRole);
        }
        if (userStatus !== 'ALL') {
            filtered = filtered.filter(u => u.status === userStatus);
        }

        if (filtered.length === 0) {
            toast({
                title: "Không có dữ liệu",
                description: "Không có dữ liệu người dùng nào phù hợp.",
                variant: "destructive"
            });
            return;
        }

        // 2. Format
        const fileName = `users-export-${new Date().toISOString().slice(0, 10)}.${userFormat}`;

        if (userFormat === 'json') {
            downloadFile(JSON.stringify(filtered, null, 2), fileName, 'application/json');
        } else {
            const columns = [
                { header: 'ID', accessor: 'id' },
                { header: 'Họ tên', accessor: 'fullName' },
                { header: 'Email', accessor: 'email' },
                { header: 'Vai trò', accessor: 'role' },
                { header: 'Trạng thái', accessor: 'status' },
                { header: 'Ngày tham gia', accessor: 'joinedAt' },
                { header: 'Tổng sự kiện', accessor: 'totalEvents' },
            ];
            downloadFile(toCSV(filtered, columns), fileName, 'text/csv');
        }

        toast({
            title: "Xuất thành công",
            description: `Đã xuất ${filtered.length} người dùng.`,
            className: "bg-green-500 text-white"
        });
    };

    const handleEmailDemo = () => {
        console.log("Sending email with export file...");
        toast({
            title: "Đã gửi email",
            description: "Giả lập gửi file export qua email admin@example.com",
        });
    };

    return (

        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Xuất dữ liệu hệ thống</h1>
                <p className="text-gray-500">Tải xuống báo cáo sự kiện và thông tin người dùng</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Export Card */}
                <Card>
                    <CardHeader>
                        <div className="p-2 w-fit rounded-lg bg-blue-100 mb-2">
                            <FileDown className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle>Export Danh sách sự kiện</CardTitle>
                        <CardDescription>Xuất dữ liệu các chiến dịch và hoạt động tình nguyện.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Từ ngày</Label>
                                <Input type="date" value={eventDateStart} onChange={e => setEventDateStart(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Đến ngày</Label>
                                <Input type="date" value={eventDateEnd} onChange={e => setEventDateEnd(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái duyệt</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={eventStatus}
                                onChange={(e) => setEventStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="PENDING">Chờ duyệt</option>
                                <option value="APPROVED">Đã duyệt</option>
                                <option value="REJECTED">Đã từ chối</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Định dạng</Label>
                            <RadioGroup defaultValue="csv" value={eventFormat} onValueChange={setEventFormat} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="csv" id="evt-csv" />
                                    <Label htmlFor="evt-csv">CSV</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="json" id="evt-json" />
                                    <Label htmlFor="evt-json">JSON</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-gray-50/50 p-4">
                        <Button variant="outline" onClick={handleEmailDemo} className="gap-2">
                            <Mail className="h-4 w-4" /> Gửi qua Email
                        </Button>
                        <Button onClick={handleExportEvents} className="bg-blue-600 hover:bg-blue-700">
                            <FileDown className="h-4 w-4 mr-2" /> Tải xuống
                        </Button>
                    </CardFooter>
                </Card>

                {/* User Export Card */}
                <Card>
                    <CardHeader>
                        <div className="p-2 w-fit rounded-lg bg-green-100 mb-2">
                            <FileDown className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle>Export Danh sách người dùng</CardTitle>
                        <CardDescription>Xuất dữ liệu tình nguyện viên và quản lý sự kiện.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                            >
                                <option value="VOLUNTEER">Tình nguyện viên (Volunteer)</option>
                                <option value="EVENT_MANAGER">Quản lý sự kiện (Event Manager)</option>
                                <option value="ALL">Tất cả</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái tài khoản</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={userStatus}
                                onChange={(e) => setUserStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="ACTIVE">Hoạt động (Active)</option>
                                <option value="LOCKED">Đang khóa (Locked)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Định dạng</Label>
                            <RadioGroup defaultValue="csv" value={userFormat} onValueChange={setUserFormat} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="csv" id="usr-csv" />
                                    <Label htmlFor="usr-csv">CSV</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="json" id="usr-json" />
                                    <Label htmlFor="usr-json">JSON</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-gray-50/50 p-4">
                        <Button variant="outline" onClick={handleEmailDemo} className="gap-2">
                            <Mail className="h-4 w-4" /> Gửi qua Email
                        </Button>
                        <Button onClick={handleExportUsers} className="bg-green-600 hover:bg-green-700">
                            <FileDown className="h-4 w-4 mr-2" /> Tải xuống
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ExportPanel;
