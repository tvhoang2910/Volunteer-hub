import { CheckCircle2, ClipboardCheck, UserCheck, UserX, Save } from "lucide-react";
import EventDetailLayout from "@/components/manager/event/EventDetailLayout";
import EventNotFound from "@/components/manager/event/EventNotFound";
import { useManagerEvent } from "@/hooks/useManagerEvent";
import { useEventCompletion } from "@/hooks/useEventCompletion";

export default function ManagerEventCompletion() {
  const { event, eventId, isReady } = useManagerEvent();
  const {
    evaluations,
    notes,
    savedAt,
    stats,
    evaluate,
    updateNote,
    saveEvaluations,
  } = useEventCompletion(event, eventId);

  const handleSave = async () => {
    const result = await saveEvaluations();
    if (result.success) {
      console.log("Saved evaluations.");
      alert("Lưu đánh giá thành công!");
    } else {
      alert("Lỗi khi lưu đánh giá");
    }
  };

  if (!isReady) return null;

  if (!event || !eventId) {
    return <EventNotFound />;
  }

  return (
    <EventDetailLayout event={event} eventId={eventId} activeTab="completion">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Đánh giá hoàn thành
          </h2>
          <p className="text-gray-500 text-sm">
            Đánh dấu tình nguyện viên hoàn thành nhiệm vụ hay không
          </p>
        </div>

        {/* Thống kê */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 flex items-center gap-3">
            <UserCheck className="w-10 h-10 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-500">Đã hoàn thành</p>
              <p className="text-2xl font-semibold text-emerald-700">
                {stats.completed} người
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 flex items-center gap-3">
            <UserX className="w-10 h-10 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">Không hoàn thành</p>
              <p className="text-2xl font-semibold text-amber-700">
                {stats.pending} người
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách đánh giá */}
        <div className="space-y-4">
          {event.volunteers.map((vol) => {
            const status = evaluations[vol.id] || "pending";
            return (
              <div
                key={vol.id}
                className="border border-gray-100 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{vol.name}</p>
                    <p className="text-sm text-gray-500">{vol.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => evaluate(vol.id, "completed")}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${status === "completed"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-gray-200 text-gray-600 hover:border-emerald-300"
                        }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Hoàn thành
                    </button>
                    <button
                      onClick={() => evaluate(vol.id, "pending")}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${status === "pending"
                          ? "bg-amber-100 border-amber-200 text-amber-700"
                          : "border-gray-200 text-gray-600 hover:border-amber-300"
                        }`}
                    >
                      Không hoàn thành
                    </button>
                  </div>
                </div>
                <textarea
                  value={notes[vol.id] || ""}
                  onChange={(e) => updateNote(vol.id, e.target.value)}
                  placeholder="Ghi chú đánh giá, hành động tiếp theo..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>
            );
          })}
        </div>

        {/* Thanh lưu trạng thái */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-dashed border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            {savedAt
              ? `Đã lưu đánh giá lúc ${savedAt}`
              : "Chưa lưu đánh giá gần đây."}
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            <Save className="w-4 h-4" />
            Lưu đánh giá
          </button>
        </div>

        {/* ✅ Nút Lưu Cuối Trang */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            Lưu tất cả thay đổi
          </button>
        </div>
      </div>
    </EventDetailLayout>
  );
}
