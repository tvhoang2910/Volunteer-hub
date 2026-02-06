import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileDown, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

const ExportPanel = () => {
  const { toast } = useToast();
  const router = useRouter();
  // Events Export State
  const [eventDateStart, setEventDateStart] = useState("");
  const [eventDateEnd, setEventDateEnd] = useState("");
  const [eventStatus, setEventStatus] = useState("ALL");
  const [eventFormat, setEventFormat] = useState("csv");

  // Users Export State
  const [userRole, setUserRole] = useState("VOLUNTEER");
  const [userStatus, setUserStatus] = useState("ALL");
  const [userFormat, setUserFormat] = useState("csv");

  const [isExportingEvents, setIsExportingEvents] = useState(false);
  const [isExportingUsers, setIsExportingUsers] = useState(false);

  // Helper: Download
  const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const isCSV = contentType?.includes("text/csv");

    // Excel on Windows is notoriously inconsistent with UTF-8 CSV.
    // UTF-16LE + BOM is the most reliable option.
    const makeUtf16LeCsvBlob = (text) => {
      const normalized = String(text ?? "").replace(/\r?\n/g, "\r\n");

      // UTF-16LE BOM bytes: FF FE
      const buffer = new ArrayBuffer(2 * (normalized.length + 1));
      const view = new DataView(buffer);
      view.setUint16(0, 0xfeff, true);
      for (let i = 0; i < normalized.length; i++) {
        view.setUint16(2 * (i + 1), normalized.charCodeAt(i), true);
      }
      return new Blob([buffer], { type: "text/csv;charset=utf-16le;" });
    };

    const file = isCSV
      ? makeUtf16LeCsvBlob(content)
      : new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Helper: Convert to CSV
  const toCSV = (data, columns) => {
    const escapeCsvValue = (value) => {
      const s = String(value ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };

    const header = columns.map((c) => escapeCsvValue(c.header)).join(",");
    const rows = data
      .map((row) =>
        columns.map((c) => escapeCsvValue(row?.[c.accessor])).join(",")
      )
      .join("\r\n");

    return `${header}\r\n${rows}`;
  };

  const toDateOnly = (value) => {
    if (!value) return "";
    // Backend returns ISO-like string, input is YYYY-MM-DD.
    // Normalize to YYYY-MM-DD for string comparison.
    return String(value).slice(0, 10);
  };

  // Export Events Logic
  const handleExportEvents = async () => {
    try {
      setIsExportingEvents(true);
      const res = await adminService.exportEvents("json");
      const rows = Array.isArray(res?.data) ? res.data : [];

      // Filter client-side to match current UI
      let filtered = rows;
      if (eventStatus !== "ALL") {
        filtered = filtered.filter(
          (e) => (e?.approvalStatus || "") === eventStatus
        );
      }
      if (eventDateStart) {
        filtered = filtered.filter(
          (e) => toDateOnly(e?.startTime) >= eventDateStart
        );
      }
      if (eventDateEnd) {
        filtered = filtered.filter(
          (e) => toDateOnly(e?.startTime) <= eventDateEnd
        );
      }

      if (filtered.length === 0) {
        toast({
          title: "Không có dữ liệu",
          description: "Không có dữ liệu sự kiện nào phù hợp để xuất.",
          variant: "destructive",
        });
        return;
      }

      const fileName = `events-export-${new Date()
        .toISOString()
        .slice(0, 10)}.${eventFormat}`;

      if (eventFormat === "json") {
        downloadFile(
          JSON.stringify(filtered, null, 2),
          fileName,
          "application/json"
        );
      } else {
        const columns = [
          { header: "ID", accessor: "id" },
          { header: "Tên sự kiện", accessor: "title" },
          { header: "Địa điểm", accessor: "location" },
          { header: "Bắt đầu", accessor: "startTime" },
          { header: "Kết thúc", accessor: "endTime" },
          { header: "Người tạo", accessor: "createdBy" },
          { header: "Trạng thái duyệt", accessor: "approvalStatus" },
        ];
        downloadFile(
          toCSV(filtered, columns),
          fileName,
          "text/csv;charset=utf-8;"
        );
      }

      toast({
        title: "Xuất thành công",
        description: `Đã xuất ${filtered.length} sự kiện.`,
        className: "bg-blue-500 text-white",
      });
    } catch (err) {
      console.error("Export events failed:", err);
      const status = err?.response?.status;
      if (status === 401) {
        toast({
          title: "Chưa có quyền truy cập",
          description:
            "Backend đang yêu cầu đăng nhập. Nếu bạn muốn bỏ qua để test, hãy bật app.security.dev.permit-admin-exports=true (dev).",
          variant: "destructive",
        });
        return;
      }
      if (status === 403) {
        toast({
          title: "Không có quyền",
          description:
            "Tài khoản của bạn không có quyền admin để xuất dữ liệu.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Xuất thất bại",
        description:
          "Không thể xuất dữ liệu sự kiện từ server. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExportingEvents(false);
    }
  };

  // Export Users Logic
  const handleExportUsers = async () => {
    try {
      setIsExportingUsers(true);

      // Backend hiện có endpoint volunteers export.
      // Nếu chọn EVENT_MANAGER thì sẽ không có dữ liệu tương ứng từ endpoint này.
      if (userRole === "EVENT_MANAGER") {
        toast({
          title: "Không có dữ liệu",
          description:
            "Hiện backend chỉ hỗ trợ export tình nguyện viên (volunteers).",
          variant: "destructive",
        });
        return;
      }

      const res = await adminService.exportVolunteers("json");
      const rows = Array.isArray(res?.data) ? res.data : [];

      let filtered = rows;
      if (userStatus !== "ALL") {
        const active = userStatus === "ACTIVE";
        filtered = filtered.filter((u) => Boolean(u?.isActive) === active);
      }

      if (filtered.length === 0) {
        toast({
          title: "Không có dữ liệu",
          description: "Không có dữ liệu người dùng nào phù hợp.",
          variant: "destructive",
        });
        return;
      }

      const fileName = `users-export-${new Date()
        .toISOString()
        .slice(0, 10)}.${userFormat}`;

      if (userFormat === "json") {
        downloadFile(
          JSON.stringify(filtered, null, 2),
          fileName,
          "application/json"
        );
      } else {
        const columns = [
          { header: "ID", accessor: "id" },
          { header: "Họ tên", accessor: "name" },
          { header: "Email", accessor: "email" },
          { header: "Hoạt động", accessor: "isActive" },
        ];
        downloadFile(
          toCSV(filtered, columns),
          fileName,
          "text/csv;charset=utf-8;"
        );
      }

      toast({
        title: "Xuất thành công",
        description: `Đã xuất ${filtered.length} người dùng.`,
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      console.error("Export users failed:", err);
      const status = err?.response?.status;
      if (status === 401) {
        toast({
          title: "Chưa có quyền truy cập",
          description:
            "Backend đang yêu cầu đăng nhập. Nếu bạn muốn bỏ qua để test, hãy bật app.security.dev.permit-admin-exports=true (dev).",
          variant: "destructive",
        });
        return;
      }
      if (status === 403) {
        toast({
          title: "Không có quyền",
          description:
            "Tài khoản của bạn không có quyền admin để xuất dữ liệu.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Xuất thất bại",
        description:
          "Không thể xuất dữ liệu người dùng từ server. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExportingUsers(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">
          Xuất dữ liệu hệ thống
        </h1>
        <p className="text-gray-500">
          Tải xuống báo cáo sự kiện và thông tin người dùng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Export Card */}
        <Card>
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-blue-100 mb-2">
              <FileDown className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Export Danh sách sự kiện</CardTitle>
            <CardDescription>
              Xuất dữ liệu các chiến dịch và hoạt động tình nguyện.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input
                  type="date"
                  value={eventDateStart}
                  onChange={(e) => setEventDateStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input
                  type="date"
                  value={eventDateEnd}
                  onChange={(e) => setEventDateEnd(e.target.value)}
                />
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
              <RadioGroup
                defaultValue="csv"
                value={eventFormat}
                onValueChange={setEventFormat}
                className="flex gap-4"
              >
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
            <Button
              variant="outline"
              onClick={handleEmailDemo}
              className="gap-2"
            >
              <Mail className="h-4 w-4" /> Gửi qua Email
            </Button>
            <Button
              onClick={handleExportEvents}
              disabled={isExportingEvents}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
            <CardDescription>
              Xuất dữ liệu tình nguyện viên và quản lý sự kiện.
            </CardDescription>
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
                <option value="EVENT_MANAGER">
                  Quản lý sự kiện (Event Manager)
                </option>
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
              <RadioGroup
                defaultValue="csv"
                value={userFormat}
                onValueChange={setUserFormat}
                className="flex gap-4"
              >
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
            <Button
              variant="outline"
              onClick={handleEmailDemo}
              className="gap-2"
            >
              <Mail className="h-4 w-4" /> Gửi qua Email
            </Button>
            <Button
              onClick={handleExportUsers}
              disabled={isExportingUsers}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileDown className="h-4 w-4 mr-2" /> Tải xuống
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ExportPanel;
