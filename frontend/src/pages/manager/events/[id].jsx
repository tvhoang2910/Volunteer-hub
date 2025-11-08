import React from "react";
import { useRouter } from "next/router";

const SAMPLE_EVENTS = [
  {
    title: "2026 Schwarz Park Maintenance Volunteer",
    location: "Dorena Lake, Oregon",
    date: "4/1/2026 - 9/30/2026",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    status: "approved",
    description: "Volunteer work to maintain Schwarz Park trails and facilities.",
  },
  {
    title: "Community Tree Planting",
    location: "Hà Nội, Việt Nam",
    date: "4/24/2026 - 10/1/2026",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdp4H-EXyavAgCcgpheUMGYjpdkGjfSMjfFA&s",
    status: "approved",
    description: "Planting trees across community parks and public spaces.",
  },
];

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const idx = parseInt(Array.isArray(id) ? id[0] : id, 10);
  const event = SAMPLE_EVENTS[idx] || null;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="mx-auto px-6 lg:px-10 pt-24 grid grid-cols-12 gap-8">
        <div className="col-span-3 sticky top-24 self-start h-[calc(100vh-120px)] flex flex-col gap-6">
          <ManagerSidebar />
          <ManagerShortcuts />
        </div>
        <div className="col-span-6">
          {event ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={event.img} alt={event.title} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h1 className="text-2xl font-semibold mb-2">{event.title}</h1>
                <p className="text-sm text-gray-600 mb-1">{event.location}</p>
                <p className="text-sm text-gray-500 mb-4">{event.date}</p>
                <p className="text-gray-700">{event.description}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-lg shadow-sm">Không tìm thấy sự kiện.</div>
          )}
        </div>
        <div className="col-span-3">
          <div className="bg-[#f3f4f6] rounded-lg p-6">Thông tin phụ</div>
        </div>
      </div>
    </div>
  );
}
