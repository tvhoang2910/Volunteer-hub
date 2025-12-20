import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';

const FeaturedSlider = ({ events, onRegister, onCancel, onClick }) => {
    if (!events || events.length === 0) return null;

    return (
        <div className="relative group mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Sự kiện nổi bật <span className="text-lg sm:text-xl">🔥</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {events.map((event, idx) => {
                    const eventId = event.event_id || event.eventId || event.id;
                    return (
                        <motion.div
                            key={`featured-${eventId}-${idx}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <EventCard
                                event={event}
                                onRegister={onRegister}
                                onCancel={onCancel}
                                onClick={() => onClick(eventId)}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeaturedSlider;
