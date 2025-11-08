import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";

import ManagerEventCard from "@/components/manager/ManagerEventCard";
import CreateEventModal from "@/components/manager/CreateEventModal";
import Tabs from "@/components/common/Tabs";
import SimpleAlert from "@/components/ui/SimpleAlert";

const managedSeed = [
  {
    title: "2026 Schwarz Park Maintenance Volunteer",
    location: "Dorena Lake, Oregon",
    date: "2026-04-01 - 2026-09-30",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    status: "approved",
  },
  {
    title: "Community Tree Planting",
    location: "Hà Nội, Việt Nam",
    date: "2026-04-24 - 2026-10-01",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdp4H-EXyavAgCcgpheUMGYjpdkGjfSMjfFA&s",
    status: "approved",
  },
];

const pendingSeed = [
  {
    title: "Clean City Campaign",
    location: "TP. Hồ Chí Minh, Việt Nam",
    date: "2026-05-06 - 2026-05-10",
    img: "https://en-cdn.nhandan.vn/images/690c590d50fc5d3afa89e2f20ddc864a03eef7b60560d70ed04a42615367b47681764174b35edea27af880c27a9f0fa2/bm1.jpg",
    status: "pending",
  },
];

const tabs = [
  { key: "managed", label: "Dự án do bạn quản lý" },
  { key: "pending", label: "Dự án chờ xét duyệt" },
];

export default function EventsIndexPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("managed");
  const [alert, setAlert] = useState(null);
  const [managedEvents, setManagedEvents] = useState(managedSeed);
  const [pendingEvents, setPendingEvents] = useState(pendingSeed);
  const [editingContext, setEditingContext] = useState(null);

  const displayedEvents =
    activeTab === "managed" ? managedEvents : pendingEvents;

  const editingEvent =
    editingContext && editingContext.tab === "managed"
      ? managedEvents[editingContext.index]
      : editingContext
      ? pendingEvents[editingContext.index]
      : null;

  const handleApprove = (index) => {
    const event = pendingEvents[index];
    if (!event) return;

    setPendingEvents((prev) => prev.filter((_, i) => i !== index));
    setManagedEvents((prev) => [{ ...event, status: "approved" }, ...prev]);
    setAlert({ type: "success", message: "Dự án đã được duyệt." });
  };

  const handleReject = (index) => {
    if (!window.confirm("Bạn có chắc muốn từ chối dự án này?")) return;
    setPendingEvents((prev) => prev.filter((_, i) => i !== index));
    setAlert({ type: "success", message: "Dự án đã bị từ chối." });
  };

  const handleDelete = (tab, index) => {
    if (!window.confirm("Bạn có chắc muốn xóa dự án này?")) return;
    if (tab === "managed") {
      setManagedEvents((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPendingEvents((prev) => prev.filter((_, i) => i !== index));
    }
    setAlert({ type: "success", message: "Dự án đã được xóa." });
  };

  const handleEdit = (tab, index) => {
    setEditingContext({ tab, index });
    setShowModal(true);
  };

  const handleSaveEvent = (newEvent) => {
    if (editingContext) {
      if (editingContext.tab === "managed") {
        setManagedEvents((prev) =>
          prev.map((evt, i) =>
            i === editingContext.index ? { ...evt, ...newEvent, status: evt.status } : evt
          )
        );
      } else {
        setPendingEvents((prev) =>
          prev.map((evt, i) =>
            i === editingContext.index ? { ...evt, ...newEvent, status: evt.status } : evt
          )
        );
      }

      setAlert({ type: "success", message: "Cập nhật dự án thành công!" });
      setActiveTab(editingContext.tab);
    } else {
      setPendingEvents((prev) => [newEvent, ...prev]);
      setActiveTab("pending");
      setAlert({
        type: "success",
        message: "Tạo dự án mới thành công! Dự án đang chờ duyệt.",
      });
    }

    setShowModal(false);
    setEditingContext(null);
  };

  const buildActions = (tab, index) => {
    if (tab === "managed") {
      return [
        {
          label: "Thêm thông tin",
          icon: Plus,
          className: "text-[#2F80ED]",
          onClick: () => router.push(`/manager/events/${index}`),
        },
        {
          label: "Sửa",
          icon: Pencil,
          className: "text-[#F2994A]",
          onClick: () => handleEdit("managed", index),
        },
        {
          label: "Xóa",
          icon: Trash2,
          className: "text-[#EB5757]",
          onClick: () => handleDelete("managed", index),
        },
      ];
    }

    return [
      {
        label: "Duyệt",
        icon: CheckCircle2,
        className: "text-[#27AE60]",
        onClick: () => handleApprove(index),
      },
      {
        label: "Từ chối",
        icon: XCircle,
        className: "text-[#EB5757]",
        onClick: () => handleReject(index),
      },
    ];
  };

  return (
    <div className="bg-gray-100 min-h-screen overflow-hidden">
      <div className="mx-auto px-6 lg:px-10 pt-24 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pr-0 lg:pr-2">
          <div className="flex justify-center mb-10">
            <button
              onClick={() => {
                setEditingContext(null);
                setShowModal(true);
              }}
              className="bg-white hover:bg-gray-50 shadow-md px-8 py-6 rounded-lg border flex flex-col items-center justify-center transition"
            >
              <div className="text-5xl font-bold text-gray-700">+</div>
              <p className="text-xl font-semibold text-gray-800">Tạo dự án</p>
            </button>
          </div>

          <div className="mb-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-lg shadow-sm grid sm:grid-cols-2 gap-6 bg-transparent"
            >
              {displayedEvents.length > 0 ? (
                displayedEvents.map((event, index) => (
                  <ManagerEventCard
                    key={`${event.title}-${index}`}
                    event={event}
                    tone={activeTab === "managed" ? "managed" : "pending"}
                    onCardClick={() => router.push(`/manager/events/${index}`)}
                    actions={buildActions(activeTab, index)}
                  />
                ))
              ) : (
                <p className="text-gray-600 text-center col-span-2 italic">
                  Không có dự án nào trong danh sách.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showModal && (
        <CreateEventModal
          onClose={() => {
            setShowModal(false);
            setEditingContext(null);
          }}
          onSave={handleSaveEvent}
          initialData={editingEvent}
        />
      )}

      {alert && (
        <SimpleAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
