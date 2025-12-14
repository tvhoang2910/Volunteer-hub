import { useRef } from "react";
import EventDetailLayout from "@/components/manager/event/EventDetailLayout";
import EventNotFound from "@/components/manager/event/EventNotFound";
import { useManagerEvent } from "@/hooks/useManagerEvent";
import PostContainer from "@/containers/PostContainer";

export default function ManagerEventExchange() {
    const { event, eventId, isReady } = useManagerEvent();

    if (!isReady) return null;

    if (!event || !eventId) {
        return <EventNotFound />;
    }

    return (
        <EventDetailLayout event={event} eventId={eventId} activeTab="exchange">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Kênh trao đổi: {event.title}</h2>
                        <p className="text-emerald-100 opacity-90">
                            Trao đổi thông tin, thông báo và thảo luận với các tình nguyện viên.
                        </p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar Information */}
                    <div className="hidden lg:block lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Thông tin nhóm</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p><strong>Sự kiện:</strong> {event.title}</p>
                                <p><strong>Thành viên:</strong> {event.volunteers?.length || 0} người</p>
                                <p><strong>Trang thái:</strong> Đang hoạt động</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">
                                    Đây là không gian riêng tư dành cho quản lý và tình nguyện viên của sự kiện.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        <PostContainer />
                    </div>
                </div>
            </div>
        </EventDetailLayout>
    );
}
