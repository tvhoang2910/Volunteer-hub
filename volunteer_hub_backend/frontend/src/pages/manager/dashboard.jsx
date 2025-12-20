"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import BasicPagination from "@/components/ui/pagination.jsx";
import ManagerEventCard from "@/components/manager/dashboard/ManagerEventCard";
import FilterBar from "@/components/dashboard/FilterBar";
import ManagerAnalyticsCard from "@/components/manager/dashboard/ManagerAnalyticsCard";
import ManagerFeaturedSlider from "@/components/manager/dashboard/ManagerFeaturedSlider";
import EventDetailSlideUp from "@/components/dashboard/EventDetailSlideUp";
import { useManagerDashboardEvents } from "@/hooks/useManagerDashboardEvents";
import { eventService } from "@/services/eventService";

export default function ManagerDashboard() {
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
  } = useManagerDashboardEvents();

  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = async (eventId) => {
    try {
      const localEvent = allEvents.find((e) => e.event_id === eventId);
      if (localEvent) setSelectedEvent(localEvent);

      setIsSlideUpOpen(true);

      const details = await eventService.getEventDetails(eventId);
      setSelectedEvent({
        ...details,
      });
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
        <ManagerAnalyticsCard events={allEvents} />
      </section>

      <section>
        <ManagerFeaturedSlider
          events={featuredEvents}
          onClick={handleEventClick}
        />
      </section>

      <section className="relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold">✨ Tất cả sự kiện của bạn</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event) => (
                <motion.div
                  key={event.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ManagerEventCard
                    event={event}
                    onClick={() => handleEventClick(event.event_id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Không tìm thấy sự kiện nào. Hãy tạo sự kiện mới!
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
        onRegister={() => {}}
        onCancel={() => {}}
        hideRegistration={true}
      />
    </div>
  );
}
