import React, { useState, useEffect, useCallback } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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
    };

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
                         Khám phá sự kiện
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
    );
}
