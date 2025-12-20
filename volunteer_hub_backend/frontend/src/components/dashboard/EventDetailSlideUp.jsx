import React, { useState, useEffect } from 'react';
import SlideUpDetail from "@/components/ui/slide-up.jsx";
import { Calendar, MapPin, Clock, Tag, Share2, Heart } from 'lucide-react';

const EventDetailSlideUp = ({ isOpen, onClose, event, onRegister, onCancel }) => {
    const [isRegistered, setIsRegistered] = useState(false);

    // Update registration status when event prop changes
    useEffect(() => {
        if (event) {
            setIsRegistered(event.registered || event.registrationStatus === 'APPROVED');
        }
    }, [event, event?.registered, event?.registrationStatus]);

    if (!event) return null;

    // Support both formats: event_id and eventId
    const eventId = event.event_id || event.eventId || event.id;
    
    // Support both formats: start_time and startTime
    const startTime = event.start_time || event.startTime;
    const endTime = event.end_time || event.endTime;

    // Mock countdown (just static for now or simple calculation)
    const daysLeft = Math.max(0, Math.ceil((new Date(startTime) - new Date()) / (1000 * 60 * 60 * 24)));

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                        src={event.image || event.thumbnailUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop&q=60'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop&q=60'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                {event.adminApprovalStatus || 'Event'}
                            </span>
                            {isRegistered && (
                                <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Đã đăng ký
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                        <div className="flex flex-col gap-2 text-sm md:text-base text-gray-200">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>{new Date(startTime).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{formatDateTime(startTime)} - {formatDateTime(endTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={16} />
                                <span>{event.location || 'Đang cập nhật'}</span>
                            </div>
                            {event.createdByName && (
                                <div className="flex items-center gap-1 text-gray-300 text-xs md:text-sm">
                                    <span>Được tổ chức bởi: <strong>{event.createdByName}</strong></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white dark:bg-zinc-900">

                    {/* Left Column: Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Giới thiệu sự kiện</h3>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {event.description || 'Chưa có mô tả cho sự kiện này.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            {event.maxVolunteers && (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Số lượng tình nguyện viên</p>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{event.maxVolunteers} người</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Trạng thái phê duyệt</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                    event.adminApprovalStatus === 'APPROVED' ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    event.adminApprovalStatus === 'PENDING' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    event.adminApprovalStatus === 'REJECTED' ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                    {event.adminApprovalStatus || 'Không xác định'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Thời gian bắt đầu</p>
                                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatDateTime(startTime)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Thời gian kết thúc</p>
                                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatDateTime(endTime)}</p>
                            </div>
                            {event.createdByName && (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Được tổ chức bởi</p>
                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{event.createdByName}</p>
                                </div>
                            )}
                            {event.registrationStatus && (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Trạng thái đăng ký</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                        event.registrationStatus === 'APPROVED' ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        event.registrationStatus === 'PENDING' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                        {event.registrationStatus}
                                    </span>
                                </div>
                            )}
                            {event.registeredAt && (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Ngày đăng ký</p>
                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatDateTime(event.registeredAt)}</p>
                                </div>
                            )}
                            {event.createdAt && (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Ngày tạo sự kiện</p>
                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatDateTime(event.createdAt)}</p>
                                </div>
                            )}
                            {event.isCompleted && (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Trạng thái hoàn thành</p>
                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Đã hoàn thành
                                    </span>
                                </div>
                            )}
                            {event.completionNotes && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Ghi chú hoàn thành</p>
                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{event.completionNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6">
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 sticky top-4">
                            <div className="mb-6">
                                <p className="text-sm text-zinc-500 mb-2 font-semibold">Thông tin sự kiện</p>
                                <div className="space-y-3">
                                    {daysLeft >= 0 && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{daysLeft} ngày</div>
                                            <p className="text-xs text-zinc-500">Thời gian còn lại</p>
                                        </div>
                                    )}
                                    {event.maxVolunteers && (
                                        <div className="text-center py-2 border-y border-zinc-200 dark:border-zinc-700">
                                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Số tình nguyện viên</p>
                                            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{event.maxVolunteers}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (isRegistered) {
                                        await onCancel(eventId);
                                        setIsRegistered(false);
                                    } else {
                                        await onRegister(eventId);
                                        setIsRegistered(true);
                                    }
                                }}
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
