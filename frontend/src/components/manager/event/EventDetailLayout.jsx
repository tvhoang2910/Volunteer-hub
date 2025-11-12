import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { managerEventSections } from "@/data/managerEvents";

export default function EventDetailLayout({
  event,
  eventId,
  activeTab,
  children,
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-8 space-y-8">
        <div className="relative bg-white shadow-xl border border-gray-100 rounded-3xl overflow-hidden">
          <div className="h-64 md:h-72 w-full relative">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${event.heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8 text-white">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => router.push("/manager/events")}
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-full backdrop-blur"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lai
                </button>
                <span className="text-sm px-4 py-1.5 rounded-full font-medium bg-white/20 backdrop-blur">
                  {event.status === "approved" ? "Dang dien ra" : event.status}
                </span>
              </div>
              <div>
                <p className="uppercase tracking-[0.2em] text-xs text-white/70 mb-2">
                  {event.subtitle}
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold mb-3">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {event.timeline.start} - {event.timeline.end}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.volunteers.length}/{event.volunteersNeeded} tình nguyện viên
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/15 text-xs uppercase tracking-wide px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <nav className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 flex gap-4 overflow-x-auto">
          {managerEventSections.map((section) => (
            <Link
              key={section.key}
              href={`/manager/events/${eventId}${section.href}`}
              className={`pb-1 text-sm font-medium border-b-2 ${
                activeTab === section.key
                  ? "text-emerald-600 border-emerald-500"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
