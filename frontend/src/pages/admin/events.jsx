import React, { useState, useEffect, useCallback } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import BasicPagination from "@/components/ui/pagination.jsx";
import EventCard from "@/components/ui/card-detail.jsx";
import SlideUpDetail from "@/components/ui/slide-up.jsx";
import SearchBar from "@/components/ui/search-bar";

import "react-multi-carousel/lib/styles.css";

const Carousel = dynamic(() => import("react-multi-carousel"), { ssr: false });

export default function EventShowcase() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "all",
    location: "all",
    search: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventsPerPage = 9;

  // Normalize BE response (RẤT QUAN TRỌNG)
  const normalizeEvent = useCallback((event = {}) => ({
    event_id: event.event_id || event.eventId || event.id,
    title: event.title || "Sự kiện",
    description: event.description || "",
    location: event.location || "Chưa cập nhật",
    start_time: event.start_time || event.startTime || "",
    end_time: event.end_time || event.endTime || "",
    registration_deadline:
      event.registration_deadline ||
      event.registrationDeadline ||
      event.end_time ||
      event.endTime ||
      "",
    current_volunteers:
      event.current_volunteers ??
      event.currentVolunteers ??
      event.registrationCount ??
      0,
    max_volunteers:
      event.max_volunteers ??
      event.maxVolunteers ??
      0,
    category: event.category || "Khác",
    image: event.image || event.thumbnailUrl || "",
  }), []);

  // Featured events
  const fetchFeaturedEvents = useCallback(async () => {
    if (!baseUrl) return;
    try {
      const res = await fetch(`${baseUrl}/api/dashboard`);
      const json = await res.json();
      const list = json?.data?.trendingEvents || json?.trendingEvents || [];
      setFeaturedEvents(list.map(normalizeEvent));
    } catch (err) {
      console.error("Fetch featured failed", err);
    }
  }, [baseUrl, normalizeEvent]);

  // All events
  const getAllEvents = useCallback(async () => {
    if (!baseUrl) return;
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/admin/events`);
      const json = await res.json();
      const list = json?.data || json?.events || [];
      setAllEvents(list.map(normalizeEvent));
    } catch (err) {
      setError("Không tải được danh sách sự kiện");
    }
  }, [baseUrl, normalizeEvent]);

  // Load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([getAllEvents(), fetchFeaturedEvents()]);
      setIsLoading(false);
    };
    load();
  }, [getAllEvents, fetchFeaturedEvents]);

  // Filter
  useEffect(() => {
    const filtered = allEvents.filter((event) => {
      const text = `${event.title} ${event.description} ${event.location}`.toLowerCase();
      const q = filters.search.toLowerCase().trim();

      return (
        (filters.category === "all" || event.category === filters.category) &&
        (filters.location === "all" || event.location === filters.location) &&
        (!q || text.includes(q))
      );
    });

    setFilteredEvents(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / eventsPerPage)));
    setCurrentPage(1);
  }, [allEvents, filters]);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  const handleRegister = async (id) => {
    await fetch(`${baseUrl}/api/events/${id}/register`, { method: "POST" });
    getAllEvents();
  };

  const handleCancel = async (id) => {
    await fetch(`${baseUrl}/api/events/${id}/cancel`, { method: "POST" });
    getAllEvents();
  };

  const handleClick = (event) => {
    setSelectedEvent(event);
    setIsSlideUpOpen(true);
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-4">Sự kiện nổi bật</h2>
        <Carousel responsive={{ desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 } }}>
          {featuredEvents.map((e) => (
            <EventCard
              key={e.event_id}
              event={e}
              onRegister={handleRegister}
              onCancel={handleCancel}
              onClick={() => handleClick(e)}
            />
          ))}
        </Carousel>
      </section>

      <section>
        <SearchBar
          placeholder="Tìm kiếm sự kiện"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
      </section>

      <section>
        <div className="grid md:grid-cols-3 gap-6">
          {paginatedEvents.map((e) => (
            <EventCard
              key={e.event_id}
              event={e}
              onRegister={handleRegister}
              onCancel={handleCancel}
              onClick={() => handleClick(e)}
            />
          ))}
        </div>
      </section>

      <BasicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <SlideUpDetail
        isOpen={isSlideUpOpen}
        onClose={() => setIsSlideUpOpen(false)}
        event={selectedEvent}
        onRegister={handleRegister}
        onCancel={handleCancel}
      />
    </div>
  );
}
