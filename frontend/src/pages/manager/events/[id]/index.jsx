import { CheckCircle2, ClipboardList, Mail, Phone } from "lucide-react";
import EventDetailLayout from "@/components/manager/event/EventDetailLayout";
import EventNotFound from "@/components/manager/event/EventNotFound";
import { useManagerEvent } from "@/hooks/useManagerEvent";

export default function ManagerEventOverview() {
  const { event, eventId, isReady } = useManagerEvent();

  if (!isReady) return null;

  if (!event || !eventId) {
    return <EventNotFound />;
  }

  return (
    <EventDetailLayout event={event} eventId={eventId} activeTab="overview">
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Người tổ chức</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.organizer.name}
                  </p>
                  <p className="text-gray-600">{event.organizer.organization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.timeline.start} - {event.timeline.end}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chi tieu</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.volunteersNeeded} tình nguyện viên
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Nhiệm vụ
                </h2>
                <p className="text-gray-700 leading-relaxed">{event.mission}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mô tả chi tiết
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {event.description}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Yêu cầu tham gia
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {event.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                Lien he nhanh
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  {event.contact.phone}
                </p>
                <p className="inline-flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  {event.contact.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EventDetailLayout>
  );
}
