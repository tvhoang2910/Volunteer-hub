import React, { useState } from "react";
import { motion } from "framer-motion";
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
    displayedEvents,
    filters,
    setFilters,
    resetFilters,
    currentPage,
    totalPages,
    handlePageChange,
    isLoading,
    error,
    registerEvent,
    cancelRegistration,
  } = useEvents();

  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleRegister = async (eventId) => {
    const success = await registerEvent(eventId);
    if (success && selectedEvent?.event_id === eventId) {
      setSelectedEvent((prev) => ({ ...prev, registered: true }));
    }
  };

  const handleCancelRegistration = async (eventId) => {
    const success = await cancelRegistration(eventId);
    if (success && selectedEvent?.event_id === eventId) {
      setSelectedEvent((prev) => ({ ...prev, registered: false }));
    }
  };

  const handleEventClick = async (eventId) => {
    try {
      const localEvent = allEvents.find((e) => e.event_id === eventId);
      if (localEvent) setSelectedEvent(localEvent);

      setIsSlideUpOpen(true);

      const details = await eventService.getEventDetails(eventId);
      setSelectedEvent(details);
    } catch (err) {
      console.error("Error fetching details:", err);
      setSelectedEvent({
        title: "Error",
        description: "Unable to fetch event details.",
        location: "N/A",
      });
    }
  };

  const closeSlideUp = () => {
    setIsSlideUpOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="container mx-auto py-8 px-0 md:px-10 space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-6">Event Dashboard</h1>
        <AnalyticsCard events={allEvents} />
      </section>

      <section>
        <FeaturedSlider
          events={featuredEvents}
          onRegister={handleRegister}
          onCancel={handleCancelRegistration}
          onClick={handleEventClick}
        />
      </section>

      <section className="relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold">✨ Khám phá sự kiện</h2>
        </div>

        <div className="mb-6 backdrop-blur bg-white/40 rounded-2xl p-4">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        </div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-[350px] rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">{error}</div>
          ) : filteredEvents.length > 0 ? (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event) => (
                <motion.div key={event.event_id}>
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
            <div className="text-center py-20 text-gray-500">
              Không tìm thấy sự kiện nào
            </div>
          )}
        </div>
      </section>

      {!isLoading && filteredEvents.length > 0 && (
        <div className="flex justify-center mt-8">
          <BasicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <EventDetailSlideUp
        isOpen={isSlideUpOpen}
        onClose={closeSlideUp}
        event={selectedEvent}
        onRegister={handleRegister}
        onCancel={handleCancelRegistration}
      />
    </div>
  );
}
