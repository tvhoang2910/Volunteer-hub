import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import EventDetailLayout from "@/components/manager/event/EventDetailLayout";
import EventNotFound from "@/components/manager/event/EventNotFound";
import { useManagerEvent } from "@/hooks/useManagerEvent";

export default function ManagerEventApprovals() {
  const { event, eventId, isReady } = useManagerEvent();
  const [pending, setPending] = useState(event?.pendingVolunteers ?? []);
  const [approved, setApproved] = useState([]);

  useEffect(() => {
    if (event) {
      setPending(event.pendingVolunteers);
      setApproved([]);
    }
  }, [event]);

  const handleApprove = (vol) => {
    setPending((prev) => prev.filter((item) => item.id !== vol.id));
    setApproved((prev) => [vol, ...prev]);
  };

  const handleReject = (volId) => {
    setPending((prev) => prev.filter((item) => item.id !== volId));
  };

  if (!isReady) return null;

  if (!event || !eventId) {
    return <EventNotFound />;
  }

  return (
    <EventDetailLayout event={event} eventId={eventId} activeTab="approvals">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Xác nhận đăng ký
          </h2>
          <p className="text-gray-500 text-sm">
            {pending.length} hồ sơ đang chờ duyệt
          </p>
        </div>

        <div className="space-y-4">
          {pending.map((vol) => (
            <div
              key={vol.id}
              className="border border-gray-100 rounded-2xl p-5 hover:border-emerald-100 transition"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{vol.name}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Nop ngay {vol.submittedAt}
                </p>
              </div>
              <p className="text-gray-700 mt-3">{vol.motivation}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => handleApprove(vol)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Duyet
                </button>
                <button
                  onClick={() => handleReject(vol.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:border-gray-600"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Từ chối
                </button>
              </div>
            </div>
          ))}

          {!pending.length && (
            <div className="text-center text-gray-500 py-10 border border-dashed border-gray-200 rounded-2xl">
              Tat ca ho so da duoc xu ly.
            </div>
          )}
        </div>

        {!!approved.length && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <p className="text-sm font-semibold text-emerald-700 mb-3">
              Da chuyen vao danh sach dang xac nhan
            </p>
            <div className="flex flex-wrap gap-3">
              {approved.map((vol) => (
                <span
                  key={vol.id}
                  className="px-3 py-1 text-sm rounded-full bg-white text-emerald-700 border border-emerald-100"
                >
                  {vol.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </EventDetailLayout>
  );
}
