import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Calendar, MapPin, MoreVertical, Edit3, Trash2, Eye } from "lucide-react";
import ManagerLayout from "@/layouts/ManagerLayout";
import { useManagerEvents } from "@/hooks/useManagerEvents";
import Link from "next/link";
import Image from "next/image";

const TABS = [
  { id: "managed", label: "Dự án đang quản lý" },
  { id: "pending", label: "Đang chờ duyệt" },
];

export default function EventsIndexPage() {
  const router = useRouter();
  const { managedEvents, pendingEvents, loading, handleDelete } = useManagerEvents();
  const [activeTab, setActiveTab] = useState("managed");
  const [searchQuery, setSearchQuery] = useState("");

  const events = activeTab === "managed" ? managedEvents : pendingEvents;

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    return events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý dự án</h1>
            <p className="text-gray-500 mt-2 text-lg">
              Theo dõi và quản lý các hoạt động tình nguyện của bạn
            </p>
          </div>
          <button
            onClick={() => router.push("/manager/events/create")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo dự án mới</span>
          </button>
        </div>

        {/* Controls: Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-1">
          {/* Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 text-base font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {tab.id === "managed" ? managedEvents.length : pendingEvents.length}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Event Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 10 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <ManagerEventCard
                  key={event.id || index}
                  event={event}
                  index={index}
                  type={activeTab}
                  onDelete={() => handleDelete(activeTab, index)}
                  itemVariants={itemVariants}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy dự án</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                  Không có dự án nào phù hợp với bộ lọc hiện tại của bạn.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ManagerEventCard({ event, index, type, onDelete, itemVariants }) {
  const router = useRouter();

  // Parse date safely
  const dateDisplay = event.date
    ? event.date.split(" - ")[0]
    : "Chưa cập nhật";

  return (
    <motion.div
      variants={itemVariants}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Area */}
      <div
        onClick={() => router.push(`/manager/events/${index}`)}
        className="relative h-48 w-full overflow-hidden rounded-t-2xl cursor-pointer bg-gray-100"
      >
        <img
          src={event.img || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge Status */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${type === 'managed'
            ? 'bg-emerald-500/90 text-white'
            : 'bg-amber-500/90 text-white'
            }`}>
            {type === 'managed' ? 'Active' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        <div className="mb-4">
          <h3
            onClick={() => router.push(`/manager/events/${index}`)}
            className="text-lg font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors"
            title={event.title}
          >
            {event.title}
          </h3>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{dateDisplay}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => router.push(`/manager/events/${index}`)}
            className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:underline transition"
          >
            Xem chi tiết
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/manager/events/${index}/edit`)}
              className="p-2 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
              title="Chỉnh sửa"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Xóa dự án"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

EventsIndexPage.getLayout = function getLayout(page) {
  return <ManagerLayout>{page}</ManagerLayout>;
};

