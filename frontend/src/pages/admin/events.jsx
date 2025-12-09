<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import BasicPagination from "@/components/ui/pagination.jsx";
import EventCard from "@/components/ui/card-detail.jsx";
import SlideUpDetail from "@/components/ui/slide-up.jsx";
import SearchBar from "@/components/ui/search-bar";
import dynamic from "next/dynamic";
import "react-multi-carousel/lib/styles.css";

const Carousel = dynamic(() => import("react-multi-carousel"), { ssr: false });

export default function EventShowcase() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "all",
    location: "all",
    search: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventsPerPage = 9;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const normalizeEvent = useCallback((event = {}) => ({
    event_id: event.event_id || event.eventId || event.id,
    title: event.title || "Sự kiện",
    description: event.description || "",
    location: event.location || "Chưa cập nhật",
    start_time: event.start_time || event.startTime || event.createdAt || "",
    end_time: event.end_time || event.endTime || event.start_time || event.startTime || "",
    registration_deadline: event.registration_deadline
      || event.registrationDeadline
      || event.end_time
      || event.endTime
      || event.start_time
      || event.startTime
      || "",
    current_volunteers: event.current_volunteers
      ?? event.currentVolunteers
      ?? event.registrationCount
      ?? 0,
    max_volunteers: event.max_volunteers
      ?? event.maxVolunteers
      ?? event.capacity
      ?? 0,
    category: event.category || "Khác",
    image: event.image || event.thumbnailUrl || ""
  }), []);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  // Add state for slide-up visibility and event details
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchFeaturedEvents = useCallback(async () => {
    if (!baseUrl) return;

    try {
      const response = await fetch(`${baseUrl}/api/dashboard`);
      if (!response.ok) {
        throw new Error("Không tải được sự kiện nổi bật");
      }

      const payload = await response.json();
      const trending = payload?.data?.trendingEvents || payload?.trendingEvents || [];
      setFeaturedEvents(trending.map(normalizeEvent));
    } catch (err) {
      console.error("Lỗi tải sự kiện nổi bật:", err);
    }
  }, [baseUrl, normalizeEvent]);

  // Fetch All Events
  const getAllEvents = useCallback(async () => {
    if (!baseUrl) return;
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải danh sách sự kiện");
      }

      const payload = await response.json();
      const events = payload?.data || payload?.events || [];
      setAllEvents(events.map(normalizeEvent));
    } catch (err) {
      console.error("Lỗi tải danh sách sự kiện:", err);
      setError(err.message);
    }
  }, [baseUrl, normalizeEvent]);

  // Filter Events
  useEffect(() => {
    const filtered = allEvents.filter((event) => {
      // Date range filter
      let dateMatch = true;
      if (filters.startDate || filters.endDate) {
        const eventDate = new Date(event.start_time);
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          dateMatch = eventDate >= start && eventDate <= end;
        } else if (filters.startDate) {
          const start = new Date(filters.startDate);
          dateMatch = eventDate >= start;
        } else if (filters.endDate) {
          const end = new Date(filters.endDate);
          dateMatch = eventDate <= end;
        }
      }

      const categoryMatch = filters.category === "all" ||
        event.category === filters.category;
      const locationMatch = filters.location === "all" ||
        event.location === filters.location;

      // Text search filter (title, description, location)
      const q = (filters.search || "").toLowerCase().trim();
      const text = [event.title, event.description, event.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchMatch = q === "" || text.includes(q);

      return dateMatch && categoryMatch && locationMatch && searchMatch;
    });
    setFilteredEvents(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / eventsPerPage)));
    setCurrentPage(1);
  }, [allEvents, filters]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([getAllEvents(), fetchFeaturedEvents()]);
      setIsLoading(false);
    };
    load();
  }, [fetchFeaturedEvents, getAllEvents]);

  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Register
  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi đăng ký sự kiện");
      }

      getAllEvents();
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  };
  import React, { useState } from "react";
  import BasicPagination from "@/components/ui/pagination.jsx";
  import EventCard from "@/components/dashboard/EventCard";
  import FilterBar from "@/components/dashboard/FilterBar";
  import AnalyticsCard from "@/components/dashboard/AnalyticsCard";
  import FeaturedSlider from "@/components/dashboard/FeaturedSlider";
  import EventDetailSlideUp from "@/components/dashboard/EventDetailSlideUp";
  import { useEvents } from "@/hooks/useEvents";
  import { eventService } from "@/services/eventService";

  export default function EventShowcase() {
    const {
      allEvents,
      featuredEvents,
      filteredEvents,
      filters,
      setFilters,
      resetFilters,
      currentPage,
      totalPages,
      handlePageChange,
      isLoading,
      error,
      registerEvent,
      cancelRegistration
    } = useEvents();

    // Slide-up state (UI specific, kept local)
    const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Handlers
    const handleRegister = async (eventId) => {
      const success = await registerEvent(eventId);
      if (success && selectedEvent?.event_id === eventId) {
        setSelectedEvent(prev => ({ ...prev, registered: true }));
      }
      );
    const handleCancelRegistration = async (eventId) => {
      const success = await cancelRegistration(eventId);
      if (success && selectedEvent?.event_id === eventId) {
        setSelectedEvent(prev => ({ ...prev, registered: false }));
      }
    };

    const handleEventClick = async (eventId) => {
      console.log("Clicked event ID:", eventId);
      try {
        // Try to find in local state first for immediate feedback
        const localEvent = allEvents.find(e => e.event_id === eventId);
        if (localEvent) setSelectedEvent(localEvent);

        setIsSlideUpOpen(true);

        // Fetch full details
        const details = await eventService.getEventDetails(eventId);
        setSelectedEvent(details);
      } catch (err) {
        console.error("Error fetching details:", err);
        // Keep showing local event if detail fetch fails
        if (!selectedEvent) {
          setSelectedEvent({
            title: "Error",
            description: "Unable to fetch event details. Please try again later.",
            location: "N/A",
            start_time: "N/A",
            category: "N/A",
          });
        }
      }
    };

    const closeSlideUp = () => {
      setIsSlideUpOpen(false);
      setSelectedEvent(null);
    };

    return (
      <div className="container mx-auto py-8 px-0 md:px-10 space-y-8">
        {/* Analytics Section */}
        <section>
          <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Event Dashboard</h1>
          <AnalyticsCard events={allEvents} />
        </section>

        {/* Featured Events Slider */}
        <section>
          <FeaturedSlider
            events={featuredEvents}
            onRegister={handleRegister}
            onCancel={handleCancelRegistration}
            onClick={handleEventClick}
          />
        </section>

        {/* Main Content Area */}
        <section className="relative">

          {/* Background gradient + subtle 3D */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/40 dark:via-zinc-900/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight drop-shadow-md">
              ✨ Khám phá sự kiện
            </h2>
          </div>

          {/* Filter Bar */}
          <div className="mb-6 backdrop-blur-xl bg-white/40 dark:bg-zinc-900/30 rounded-2xl shadow-xl border border-white/30 dark:border-zinc-800/40 p-4">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Events List */}
          <div className="min-h-[400px]">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-[350px] rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 animate-pulse shadow-inner"
                    style={{ transform: "rotateX(5deg) rotateY(-5deg)" }}
                  />
                ))}
              </div>
            ) : error ? (
              /* Error Box */
              <div className="text-center py-20 rounded-2xl bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 shadow-lg">
                <p className="text-red-700 dark:text-red-300 font-medium text-lg">
                  Lỗi: {error}
                </p>
              </div>
            ) : filteredEvents.length > 0 ? (
              /* Animated Event List */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.event_id}
                    whileHover={{
                      scale: 1.035,
                      rotateX: 4,
                      rotateY: -4,
                      boxShadow: "0px 25px 60px rgba(0,0,0,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                    className="transform-gpu"
                  >
                    <EventCard
                      event={event}
                      onRegister={handleRegister}
                      onCancel={handleCancelRegistration}
                      onClick={() => handleEventClick(event.event_id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/30 border border-dashed border-zinc-300 dark:border-zinc-700 shadow-lg backdrop-blur-md">
                <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                  Không tìm thấy sự kiện nào phù hợp
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pagination */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="flex justify-center mt-8">
            <BasicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Event Details Slide-up */}
        <EventDetailSlideUp
          isOpen={isSlideUpOpen}
          onClose={closeSlideUp}
          event={selectedEvent}
          onRegister={handleRegister}
          onCancel={handleCancelRegistration}
        />
      </div>
    )
  }
}
<SelectContent>
