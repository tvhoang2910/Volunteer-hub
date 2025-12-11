
"use client";

import { useManagerDashboard } from "@/hooks/useManagerDashboard";
import SummaryCards from "@/components/manager/dashboard/SummaryCards";
import DashboardCharts from "@/components/manager/dashboard/DashboardCharts";
import DashboardEventLists from "@/components/manager/dashboard/DashboardEventLists";

export default function ManagerDashboard() {
  const { stats, newEvents, trending, monthlyStats, loading } = useManagerDashboard();

  if (loading) {
    return <div className="p-8">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-[hsl(var(--foreground))] p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-orange-500 bg-clip-text">
            Bảng điều khiển tình nguyện viên
          </h1>
          <p className="text-gray-600">
            Tổng hợp hoạt động, sự kiện và mức độ tương tác cộng đồng
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards stats={stats} />

        {/* Charts Section */}
        <DashboardCharts monthlyStats={monthlyStats} trending={trending} />

        {/* Event Lists */}
        <DashboardEventLists newEvents={newEvents} trending={trending} />
      </div>
    </div>
  );
}
