// components/landing/PendingEvents.jsx
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MdLocationOn, MdAccessTime, MdPending, MdInfo } from "react-icons/md";
import { eventService } from "@/services/eventService";

const PendingEventCard = ({ event, index }) => (
  <div
    className="group relative h-[420px] w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl border-2 border-amber-400"
    data-aos="fade-up"
    data-aos-delay={index * 100}
  >
    {/* Image Background */}
    <div className="absolute inset-0 h-full w-full">
      <Image
        src={event.image || "/default-event.jpg"}
        alt={event.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-800/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
    </div>

    {/* Pending Badge */}
    <div className="absolute top-4 right-4 z-10">
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-amber-300">
        <MdPending className="animate-pulse" />
        Đang chờ duyệt
      </span>
    </div>

    {/* Content */}
    <div className="absolute bottom-0 left-0 w-full p-6 text-white transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
      {/* Date & Location */}
      <div className="flex items-center gap-4 text-sm text-gray-300 mb-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 delay-100">
        {event.start_time && (
          <span className="flex items-center gap-1">
            <MdAccessTime className="text-amber-400" />
            {new Date(event.start_time).toLocaleDateString("vi-VN")}
          </span>
        )}
        <span className="flex items-center gap-1">
          <MdLocationOn className="text-amber-400" />
          {event.location}
        </span>
      </div>

      <h3 className="text-2xl font-bold leading-tight mb-2 text-white group-hover:text-amber-300 transition-colors">
        {event.title}
      </h3>

      <p className="text-sm text-gray-300 line-clamp-2 mb-4 opacity-90">
        {event.description || "Sự kiện tình nguyện đang chờ phê duyệt từ admin"}
      </p>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Số lượng tối đa</span>
          <span className="text-lg font-bold text-amber-400">
            {event.max_volunteers || 0} người
          </span>
        </div>

        <button
          disabled
          className="flex items-center gap-2 rounded-full bg-gray-600 px-4 py-2 text-sm font-semibold text-white cursor-not-allowed opacity-60"
        >
          <MdInfo /> Chờ duyệt
        </button>
      </div>
    </div>
  </div>
);

export default function PendingEvents() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        const data = await eventService.getPendingEvents();
        setPendingEvents(data?.events || []);
      } catch (error) {
        console.error("Error loading pending events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvents();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  const isShowMoreVisible = visibleCount < pendingEvents.length;

  if (loading) {
    return (
      <div className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-gray-500">Đang tải sự kiện chờ duyệt...</p>
          </div>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị section nếu có sự kiện pending
  if (pendingEvents.length === 0) {
    return null;
  }

  return (
    <div className="py-20 lg:py-28 relative bg-gradient-to-b from-amber-50/50 to-white">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 mb-4">
            <MdPending className="text-amber-600 animate-pulse" />
            <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
              Đang chờ phê duyệt
            </span>
          </div>

          <h2
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4"
            data-aos="fade-up"
          >
            Sự kiện chờ duyệt
          </h2>

          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Những sự kiện tình nguyện mới được tạo bởi các tổ chức, đang chờ phê
            duyệt từ ban quản trị
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pendingEvents.slice(0, visibleCount).map((event, index) => (
            <PendingEventCard
              key={event.event_id || index}
              event={event}
              index={index}
            />
          ))}
        </div>

        {/* Show More Button */}
        {isShowMoreVisible && (
          <div className="flex justify-center mt-12" data-aos="fade-up">
            <Button
              onClick={handleShowMore}
              variant="outline"
              size="lg"
              className="group bg-white hover:bg-amber-50 border-2 border-amber-400 text-amber-700 font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30 hover:scale-105"
            >
              Xem thêm sự kiện chờ duyệt
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-16 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
          <MdInfo className="inline-block text-amber-600 text-3xl mb-2" />
          <p className="text-amber-800 font-medium">
            Các sự kiện này sẽ được admin xem xét và phê duyệt trước khi công
            khai cho tất cả mọi người
          </p>
        </div>
      </div>
    </div>
  );
}
