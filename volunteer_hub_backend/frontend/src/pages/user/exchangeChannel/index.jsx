import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { eventService } from '@/services/eventService';
import { CalendarDays, MapPin, Users, MessageSquare } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function ExchangeChannel() {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        setLoading(true);
        // Get user's registered events
        const events = await eventService.getMyRegisteredEvents();
        console.log('[ExchangeChannel] My registered events:', events);
        
        // Filter only APPROVED registrations
        const approved = events.filter(e => e.registrationStatus === 'APPROVED' || e.registrationStatus === 'CHECKED_IN' || e.registrationStatus === 'COMPLETED');
        console.log('[ExchangeChannel] Approved events:', approved);
        setApprovedEvents(approved);
      } catch (err) {
        console.error('[ExchangeChannel] Error fetching events:', err);
        setError(err.message || 'Không thể tải danh sách sự kiện');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedEvents();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kênh trao đổi</h1>
          <p className="text-gray-600">Đang tải...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kênh trao đổi</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kênh trao đổi</h1>
        <p className="text-gray-600">Tham gia vào các sự kiện bạn đã đăng ký để trao đổi và thảo luận.</p>
      </div>

      {approvedEvents.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có sự kiện nào</h3>
          <p className="text-gray-500">Bạn cần được duyệt tham gia sự kiện để xem kênh trao đổi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedEvents.map((event) => (
            <Link 
              key={event.eventId} 
              href={`/user/exchangeChannel/event/${event.eventId}`} 
              className="block h-full"
            >
              <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer overflow-hidden border-none">
                <div 
                  className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-400 p-4 relative"
                  style={{
                    backgroundImage: event.thumbnailUrl ? `url(${event.thumbnailUrl.startsWith('http') ? event.thumbnailUrl : `${API_BASE_URL}${event.thumbnailUrl}`})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className={`absolute inset-0 ${event.thumbnailUrl ? 'bg-black/40' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}></div>
                  <div className="relative z-10">
                    <h3 className="text-white text-xl font-bold truncate">{event.title}</h3>
                    <p className="text-white/80 text-sm truncate mt-1">{event.description}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur px-2 py-1 rounded text-xs text-white font-medium">
                    {event.registrationStatus === 'APPROVED' ? 'Đã duyệt' : 
                     event.registrationStatus === 'CHECKED_IN' ? 'Đã check-in' : 'Hoàn thành'}
                  </div>
                </div>
                <CardContent className="p-4 pt-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="truncate">{event.location || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-500" />
                      <span>{event.startTime ? new Date(event.startTime).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>{event.maxVolunteers || 0} tình nguyện viên</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 border-t pt-2">
                    Nhấn để xem bài viết
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}