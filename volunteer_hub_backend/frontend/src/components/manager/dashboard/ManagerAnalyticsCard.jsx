import React, { useState, useEffect } from "react";
import { BarChart3, Users, CalendarCheck, TrendingUp, FileText } from "lucide-react";
import managerService from "@/services/managerService";

const ManagerAnalyticsCard = ({ events }) => {
  const totalEvents = events?.length || 0;
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await managerService.getDashboardStats();
        setStats({
          totalMembers: data.summary?.totalMembers || 0,
          totalPosts: data.summary?.totalPosts || 0,
        });
      } catch (error) {
        console.error("Error fetching manager stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate upcoming events
  const upcomingEvents = events?.filter(
    (e) => new Date(e.start_time || e.startTime) > new Date()
  ).length || 0;

  // Mock monthly data for the mini chart
  const monthlyData = [4, 6, 3, 8, 5, 9];
  const maxVal = Math.max(...monthlyData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 sm:mb-8">
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl text-emerald-600 dark:text-emerald-400">
          <CalendarCheck size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Tổng sự kiện
          </p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalEvents}
          </p>
          <p className="text-[10px] text-zinc-400">Sự kiện đã được duyệt</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg sm:rounded-xl text-orange-600 dark:text-orange-400">
          <TrendingUp size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Sắp diễn ra
          </p>
          <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
            {upcomingEvents}
          </p>
          <p className="text-[10px] text-zinc-400">Sự kiện sắp tới</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg sm:rounded-xl text-pink-600 dark:text-pink-400">
          <Users size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Tổng thành viên
          </p>
          {loading ? (
            <div className="text-lg sm:text-2xl font-bold text-zinc-400 animate-pulse">
              ...
            </div>
          ) : (
            <p className="text-lg sm:text-2xl font-bold text-pink-600 dark:text-pink-400">
              {stats.totalMembers}
            </p>
          )}
          <p className="text-[10px] text-zinc-400">Người tham gia các sự kiện</p>
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
              className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-t-sm hover:bg-emerald-500 transition-colors"
              style={{ height: `${(val / maxVal) * 100}%` }}
              title={`Tháng ${idx + 1}: ${val}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalyticsCard;
