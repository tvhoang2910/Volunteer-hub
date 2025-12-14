import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onRegister, onCancel, onClick }) => {
    const isRegistered = event.registered;

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)" }}
            className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 h-full flex flex-col cursor-pointer"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                    src={event.image || `https://source.unsplash.com/random/800x600?${event.category}`}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60'; }}
                />
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-2">
                    <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-zinc-800 dark:text-zinc-200 shadow-sm">
                        {event.category}
                    </span>
                    {isRegistered && (
                        <span className="px-3 py-1 text-xs font-medium bg-green-500/90 backdrop-blur-sm rounded-full text-white shadow-sm">
                            Đã đăng ký
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2 sm:mb-3">
                    <Calendar size={14} className="sm:w-3.5 sm:h-3.5" />
                    <span className="text-xs">{new Date(event.start_time).toLocaleDateString('vi-VN')}</span>
                    <span className="mx-0.5 sm:mx-1">•</span>
                    <MapPin size={14} className="sm:w-3.5 sm:h-3.5" />
                    <span className="truncate max-w-[120px] text-xs">{event.location}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {event.title}
                </h3>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-grow">
                    {event.description}
                </p>

                <div className="mt-auto pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            isRegistered ? onCancel(event.event_id) : onRegister(event.event_id);
                        }}
                        className={`px-4 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-all duration-300 ${isRegistered
                            ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                            }`}
                    >
                        {isRegistered ? "Hủy đăng ký" : "Đăng ký ngay"}
                    </button>

                    <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <ArrowRight size={16} className="sm:w-4 sm:h-4" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EventCard;
