'use client'

import dynamic from 'next/dynamic'
import { useStatistics } from '@/hooks/useStatistics'
import { Loader2 } from 'lucide-react'

// Dynamic imports để giảm bundle size (~800KB+)
const StatsOverview = dynamic(() => import('@/components/admin/dashboard/StatsOverview').then(mod => ({ default: mod.StatsOverview })), {
  loading: () => <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
})

const AdminRoleRequests = dynamic(() => import('@/components/admin/dashboard/AdminRoleRequests').then(mod => ({ default: mod.AdminRoleRequests })), {
  loading: () => <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
})

const WeeklyActivityChart = dynamic(() => import('@/components/admin/dashboard/WeeklyActivityChart').then(mod => ({ default: mod.WeeklyActivityChart })), {
  loading: () => <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
})

const ViewsStatistics = dynamic(() => import('@/components/admin/dashboard/ViewsStatistics').then(mod => ({ default: mod.ViewsStatistics })), {
  loading: () => <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
})

const EventsFrequencyChart = dynamic(() => import('@/components/admin/dashboard/EventsFrequencyChart').then(mod => ({ default: mod.EventsFrequencyChart })), {
  loading: () => <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
})

const EventTypeDistribution = dynamic(() => import('@/components/admin/dashboard/EventTypeDistribution').then(mod => ({ default: mod.EventTypeDistribution })), {
  loading: () => <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
})

const YearlyGrowthChart = dynamic(() => import('@/components/admin/dashboard/YearlyGrowthChart').then(mod => ({ default: mod.YearlyGrowthChart })), {
  loading: () => <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
})

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

        {/* Admin Role Requests - Pending approvals */}
        <AdminRoleRequests />

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
