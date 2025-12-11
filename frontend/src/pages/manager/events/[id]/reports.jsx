import { CheckCircle2, FileText } from "lucide-react";
import EventDetailLayout from "@/components/manager/event/EventDetailLayout";
import EventNotFound from "@/components/manager/event/EventNotFound";
import { useManagerEvent } from "@/hooks/useManagerEvent";
import { useEventReport } from "@/hooks/useEventReport";

export default function ManagerEventReports() {
  const { event, eventId, isReady } = useManagerEvent();
  const { totalHours } = useEventReport(event);

  if (!isReady) return null;

  if (!event || !eventId) {
    return <EventNotFound />;
  }

  return (
    <EventDetailLayout event={event} eventId={eventId} activeTab="reports">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Báo cáo & thống kê
            </h2>
            <p className="text-gray-500 text-sm">
              Cập nhật theo thời gian thực từ hệ thống VolunteerHub
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">
            <FileText className="w-4 h-4" />
            Xem báo cáo chi tiết
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-2xl bg-emerald-50">
            <p className="text-sm text-gray-500">Tiến độ</p>
            <p className="text-3xl font-semibold text-emerald-700">
              {event.report.progress}%
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50">
            <p className="text-sm text-gray-500">Tổng giờ đóng góp</p>
            <p className="text-3xl font-semibold text-blue-700">{totalHours}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50">
            <p className="text-sm text-gray-500">Điểm hài lòng</p>
            <p className="text-3xl font-semibold text-amber-700">
              {event.report.satisfaction}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-100">
            <p className="text-sm text-gray-500">Sự cố</p>
            <p className="text-3xl font-semibold text-gray-800">
              {event.report.incidents}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Điểm nhấn gần đây
            </p>
            <ul className="space-y-3">
              {event.report.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">
              File báo cáo
            </p>
            <div className="space-y-3">
              {event.report.files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      Cập nhật {file.updated}
                    </p>
                  </div>
                  <button className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                    Tải xuống
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Volunteer List Table */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">
              Danh sách tình nguyện viên tham gia
            </h3>
            <span className="text-sm text-gray-500">
              Tổng: {event.volunteers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-6 py-3">Họ và tên</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3 text-center">Giờ đóng góp</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {event.volunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vol.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {vol.role || "Tình nguyện viên"}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {vol.hours || 0}h
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vol.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : vol.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : vol.status === "incomplete"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {vol.status === "completed"
                          ? "Hoàn thành"
                          : vol.status === "absent"
                            ? "Vắng mặt"
                            : vol.status === "incomplete"
                              ? "Chưa hoàn thành"
                              : "Đang tham gia"}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!event.volunteers || event.volunteers.length === 0) && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500 italic"
                    >
                      Chưa có dữ liệu tình nguyện viên
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EventDetailLayout>
  );
}
