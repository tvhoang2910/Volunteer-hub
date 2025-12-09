'use client'

import { useStatistics } from '@/hooks/useStatistics'
import { StatsOverview } from '@/components/admin/dashboard/StatsOverview'
import { WeeklyActivityChart } from '@/components/admin/dashboard/WeeklyActivityChart'
import { ViewsStatistics } from '@/components/admin/dashboard/ViewsStatistics'
import { EventsFrequencyChart } from '@/components/admin/dashboard/EventsFrequencyChart'
import { EventTypeDistribution } from '@/components/admin/dashboard/EventTypeDistribution'
import { YearlyGrowthChart } from '@/components/admin/dashboard/YearlyGrowthChart'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { data, isLoading } = useStatistics()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Tổng Quan</h1>
          <p className="text-gray-600">Theo dõi và phân tích hiệu suất hoạt động</p>
        </div>

        {/* Stats Cards */}
        <StatsOverview data={data.overview} />

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WeeklyActivityChart data={data.weeklyData} />
          <ViewsStatistics data={data.weeklyData} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventsFrequencyChart data={data.chartData} />
          <EventTypeDistribution data={data.eventTypeData} />
        </div>

        {/* Year Overview */}
        <YearlyGrowthChart data={data.chartData} />
      </div>
    </div>
  )
}
