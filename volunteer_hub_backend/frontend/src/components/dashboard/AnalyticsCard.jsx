import React, { useState, useEffect } from "react";
import { BarChart3, Users, CalendarCheck, TrendingUp } from "lucide-react";
import { eventService } from "@/services/eventService";

const AnalyticsCard = ({ events }) => {
  const totalEvents = events.length;
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingRegistered, setLoadingRegistered] = useState(true);

  useEffect(() => {
    const fetchUpcomingCount = async () => {
      try {
        setLoadingUpcoming(true);
        const count = await eventService.getUpcomingEventsCount();
        // Ensure count is a number
        const numericCount = typeof count === 'number' ? count : 
                            (typeof count === 'object' && count?.count !== undefined) ? count.count : 0;
        setUpcomingEvents(numericCount);
      } catch (error) {
        console.error("Error fetching upcoming events count:", error);
        const fallbackCount = events.filter(
          (e) => new Date(e.start_time || e.startTime) > new Date()
        ).length;
        setUpcomingEvents(fallbackCount);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    const fetchRegisteredCount = async () => {
      try {
        setLoadingRegistered(true);
        const count = await eventService.getRegisteredEventsCount();
        setRegisteredCount(typeof count === 'number' ? count : 0);
      } catch (error) {
        console.error("Error fetching registered events count:", error);
        // Fallback: use local filtering
        const fallbackCount = events.filter((e) => e.registered).length;
        setRegisteredCount(fallbackCount);
      } finally {
        setLoadingRegistered(false);
      }
    };

    fetchUpcomingCount();
    fetchRegisteredCount();
  }, [events]);

  // Mock monthly data for the mini chart
  const monthlyData = [4, 6, 3, 8, 5, 9];
  const maxVal = Math.max(...monthlyData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 sm:mb-8">
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl text-blue-600 dark:text-blue-400">
          <CalendarCheck size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Tổng sự kiện
          </p>
          <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {typeof totalEvents === 'number' ? totalEvents : 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl text-green-600 dark:text-green-400">
          <TrendingUp size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Sắp diễn ra
          </p>
          {loadingUpcoming ? (
            <div className="text-lg sm:text-2xl font-bold text-zinc-400 dark:text-zinc-600 animate-pulse">
              ...
            </div>
          ) : (
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {typeof upcomingEvents === 'number' ? upcomingEvents : 0}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl text-purple-600 dark:text-purple-400">
          <Users size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Đã đăng ký
          </p>
          {loadingRegistered ? (
            <div className="text-lg sm:text-2xl font-bold text-zinc-400 dark:text-zinc-600 animate-pulse">
              ...
            </div>
          ) : (
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {typeof registeredCount === 'number' ? registeredCount : 0}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Theo tháng
          </p>
          <BarChart3 size={16} className="text-zinc-400" />
        </div>
        <div className="flex items-end gap-1 h-8 sm:h-10">
          {monthlyData.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-t-sm hover:bg-blue-500 transition-colors"
              style={{ height: `${(val / maxVal) * 100}%` }}
              title={`Tháng ${idx + 1}: ${val}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
