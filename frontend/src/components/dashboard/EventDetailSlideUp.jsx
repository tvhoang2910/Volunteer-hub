import React from 'react';
import SlideUpDetail from "@/components/ui/slide-up.jsx";
import { Calendar, MapPin, Clock, Tag, Share2, Heart } from 'lucide-react';

const EventDetailSlideUp = ({ isOpen, onClose, event, onRegister, onCancel }) => {
    if (!event) return null;

    const isRegistered = event.registered;

    // Mock countdown (just static for now or simple calculation)
    const daysLeft = Math.max(0, Math.ceil((new Date(event.start_time) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
        <SlideUpDetail
            isOpen={isOpen}
            onClose={onClose}
            title="" // Custom header inside
            className="max-w-4xl mx-auto rounded-t-3xl overflow-hidden"
        >
            <div className="-m-6">
                {/* Banner Image */}
                <div className="relative h-64 md:h-80 w-full">
                    <img
                        src={event.image || `https://source.unsplash.com/random/1200x600?${event.category}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop&q=60'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                            {event.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                        <div className="flex items-center gap-4 text-sm md:text-base text-gray-200">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>{new Date(event.start_time).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={16} />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white dark:bg-zinc-900">

                    {/* Left Column: Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Giới thiệu sự kiện</h3>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                                {event.description}
                                {/* Mock long description if short */}
                                {event.description && event.description.length < 100 &&
                                    "\n\nTham gia sự kiện này để cập nhật những kiến thức mới nhất, giao lưu với các chuyên gia đầu ngành và mở rộng mạng lưới quan hệ của bạn. Chương trình bao gồm các phiên thảo luận, workshop thực hành và cơ hội hỏi đáp trực tiếp."
                                }
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Nội dung chương trình</h3>
                            <ul className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <li key={item} className="flex gap-3">
                                        <div className="flex-none w-16 text-sm font-semibold text-zinc-500">
                                            {8 + item}:00
                                        </div>
                                        <div className="pb-4 border-l-2 border-zinc-200 pl-4 relative">
                                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Session {item}: Chủ đề chi tiết</h4>
                                            <p className="text-sm text-zinc-500">Diễn giả khách mời</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6">
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 sticky top-4">
                            <div className="text-center mb-6">
                                <p className="text-sm text-zinc-500 mb-1">Sự kiện diễn ra trong</p>
                                <div className="text-3xl font-bold text-blue-600">{daysLeft} ngày</div>
                            </div>

                            <button
                                onClick={() => isRegistered ? onCancel(event.event_id) : onRegister(event.event_id)}
                                className={`w-full py-3 rounded-xl font-bold text-lg mb-3 transition-all ${isRegistered
                                        ? "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                                    }`}
                            >
                                {isRegistered ? "Hủy đăng ký" : "Đăng ký ngay"}
                            </button>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-zinc-700 transition-colors">
                                    <Share2 size={18} />
                                    <span className="text-sm font-medium">Chia sẻ</span>
                                </button>
                                <button className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-zinc-700 transition-colors">
                                    <Heart size={18} />
                                    <span className="text-sm font-medium">Lưu</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SlideUpDetail>
    );
};

export default EventDetailSlideUp;
