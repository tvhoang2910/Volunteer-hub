import React, { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import BasicPagination from "@/components/ui/pagination.jsx";
import EventCard from "@/components/ui/card-detail.jsx";


export default function EventShowcase() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    date: "all",
    category: "all",
    location: "all"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventsPerPage = 9;

  // Fetch Featured Events
  const getFeaturedEvents = async () => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/highlight`;
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải sự kiện nổi bật");
      }

      const data = await response.json();
      setFeaturedEvents(data.events || data);
    } catch (error) {
      console.error("Lỗi tải sự kiện nổi bật:", error);
      setError(error.message);
    }
  };

  // Fetch All Events with Pagination
  const getAllEvents = async (page = 1) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events?page=${page}&limit=${eventsPerPage}`;
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

  // Filter Events
  useEffect(() => {
    const filtered = allEvents.filter((event) => {
      const dateMatch = filters.date === "all" ||
        (event.start_time && event.start_time.includes(filters.date));
      const categoryMatch = filters.category === "all" ||
        event.category === filters.category;
      const locationMatch = filters.location === "all" ||
        event.location === filters.location;

      return dateMatch && categoryMatch && locationMatch;
    });
    setFilteredEvents(filtered);
  }, [allEvents, filters]);

  // Initial Load
  useEffect(() => {
    getFeaturedEvents();
    getAllEvents(1);
  }, []);

  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getAllEvents(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Register
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

      // Refresh events after registration
      getAllEvents(currentPage);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  };

  // Handle Cancel Registration
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

      // Refresh events after cancellation
      getAllEvents(currentPage);
    } catch (error) {
      console.error("Lỗi hủy đăng ký:", error);
    }
  };

  return (
    <div className="container mx-auto pt-10 pl-64 space-y-6">
      <div className="p-6">
        {/* Featured Events Slider */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sự kiện nổi bật</h2>
          <motion.div
            className="flex space-x-4 overflow-x-auto pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {featuredEvents.length > 0 ? (
              featuredEvents.slice(0, 10).map((event) => (
                <div key={event.event_id} className="min-w-[350px]">
                  <EventCard
                    event={event}
                    onRegister={handleRegister}
                    onCancel={handleCancelRegistration}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Không có sự kiện nổi bật</p>
            )}
          </motion.div>
        </section>

        {/* Filter Bar */}
        <section className="mb-6">
          <div className="flex space-x-4">
            <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, date: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ngày" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="2025-10-21">Hôm nay</SelectItem>
                <SelectItem value="2025-10">Tuần này</SelectItem>
                <SelectItem value="2025">Tháng này</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Webinar">Webinar</SelectItem>
                <SelectItem value="Tech Talk">Tech Talk</SelectItem>
                <SelectItem value="Meetup">Meetup</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                <SelectItem value="TP.HCM">TP.HCM</SelectItem>
                <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Events List */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tất cả sự kiện</h2>
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Không tìm thấy sự kiện</p>
            </div>
          )}
        </section>
      </div>

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
  );
}