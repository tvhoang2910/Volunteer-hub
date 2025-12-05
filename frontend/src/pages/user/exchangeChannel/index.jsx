import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EventCard from "@/components/ui/card-detail.jsx";
import BasicPagination from "@/components/ui/pagination.jsx";

export default function ExchangeChannelPage() {
  const router = useRouter();
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventsPerPage = 9;

  const getAllEvents = async (page = 1) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/enrolled?page=${page}&limit=${eventsPerPage}`;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải danh sách sự kiện");
      }

      const data = await response.json();
      setAllEvents(data.events || data.data || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / eventsPerPage));
    } catch (error) {
      console.error("Lỗi tải danh sách sự kiện:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllEvents(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setFilteredEvents(allEvents);
  }, [allEvents]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getAllEvents(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      getAllEvents(currentPage);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi hủy đăng ký");
      }

      getAllEvents(currentPage);
    } catch (error) {
      console.error("Lỗi hủy đăng ký:", error);
    }
  };

  const handleEventClick = (eventId) => {
    // Chuyển hướng đến kênh trao đổi của sự kiện với groupID = eventID
    router.push(`/user/exchangeChannel/groups/${eventId}`);
  };

  return (
    <div className="container mx-auto pt-10 pl-64 space-y-6">
      <div className="p-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Kênh trao đổi</h2>
          {isLoading ? (
            <div className="text-center py-10">
              <p>Đang tải...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>Lỗi: {error}</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  onRegister={handleRegister}
                  onCancel={handleCancelRegistration}
                  onClick={() => handleEventClick(event.event_id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Không tìm thấy sự kiện</p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="flex justify-center my-6">
            <BasicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}