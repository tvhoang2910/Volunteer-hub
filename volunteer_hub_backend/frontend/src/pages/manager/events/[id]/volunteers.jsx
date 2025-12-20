import { Search, Download } from "lucide-react";
import EventDetailLayout from "@/components/manager/event/EventDetailLayout";
import EventNotFound from "@/components/manager/event/EventNotFound";
import { useManagerEvent } from "@/hooks/useManagerEvent";
import { useEventVolunteers } from "@/hooks/useEventVolunteers";
import { toast } from "@/hooks/use-toast";

export default function ManagerEventVolunteers() {
  const { event, eventId, isReady } = useManagerEvent();
  const {
    volunteers,
    filteredVolunteers,
    search,
    setSearch,
    changeStatus,
    saveVolunteers,
  } = useEventVolunteers(event, eventId);

  const handleSave = async () => {
    const result = await saveVolunteers();
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Danh sách tình nguyện viên đã được lưu!",
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu danh sách.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    if (!volunteers.length) {
      toast({
        title: "Thông báo",
        description: "Không có dữ liệu để xuất.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["STT", "Họ và tên", "Ngày tham gia", "Email", "Trạng thái"];
    const csvContent = [
      headers.join(","),
      ...volunteers.map((vol, index) => [
        index + 1,
        `"${vol.name || ''}"`,
        `"${vol.joinedAt || 'N/A'}"`,
        `"${vol.email || ''}"`,
        `"${vol.isActive ? 'Đang hoạt động' : 'Không hoạt động'}"`
      ].join(","))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `volunteers_${event?.title?.replace(/\s+/g, '_') || 'event'}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Thành công",
      description: "Đã xuất danh sách tình nguyện viên!",
    });
  };

  if (!isReady) return null;
  if (!event || !eventId) return <EventNotFound />;

  return (
    <EventDetailLayout event={event} eventId={eventId} activeTab="volunteers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách tình nguyện viên
            </h2>
            <p className="text-gray-500 text-sm">
              {volunteers.length} người đã được xác nhận
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" />
              Xuất danh sách
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Họ và tên
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Ngày tham gia
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Liên lạc
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((vol, index) => (
                <tr
                  key={vol.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {vol.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{vol.joinedAt || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {vol.email ? (
                      <a href={`mailto:${vol.email}`} className="text-emerald-600 hover:underline">
                        {vol.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Chưa cập nhật</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vol.isActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {vol.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredVolunteers.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-8 italic"
                  >
                    Không có tình nguyện viên phù hợp với từ khóa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-full transition"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </EventDetailLayout>
  );
}

