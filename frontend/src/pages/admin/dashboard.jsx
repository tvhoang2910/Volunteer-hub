'use client'

import { Plane, Users, RefreshCw, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, Tooltip, AreaChart, Area } from 'recharts'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
  { month: "July", desktop: 10 },
  { month: "August", desktop: 100 },
  { month: "September", desktop: 36 },
  { month: "October", desktop: 18 },
  { month: "November", desktop: 90 },
  { month: "December", desktop: 120 },
]

const weeklyData = [
  { day: "Monday", pageViews: 3200, orders: 2400 },
  { day: "Tuesday", pageViews: 2800, orders: 1800 },
  { day: "Wednesday", pageViews: 4200, orders: 3200 },
  { day: "Thursday", pageViews: 3800, orders: 2800 },
  { day: "Friday", pageViews: 4800, orders: 3800 },
  { day: "Saturday", pageViews: 3400, orders: 2200 },
  { day: "Sunday", pageViews: 4000, orders: 3000 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#3b82f6",
  },
}

const flightStatusData = [
  { name: 'Chưa Cất Cánh', value: 3 },
  { name: 'Đang Bay', value: 2 },
  { name: 'Đã Hạ Cánh', value: 35 }
]

const aircraftData = [
  { name: 'Airbus A320', value: 3 },
  { name: 'Airbus A330', value: 2 },
  { name: 'Boeing 767', value: 1 },
  { name: 'Boeing 777', value: 2 }
]

const COLORS = ['#3b82f6', '#4CAF50', '#84cc16', '#06b6d4']

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState({
    "flights": 0,
    "tickets": 0,
    "revenue": 0
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin')
    }
    getStatistic()
  }, [router])

  const getStatistic = async () => {
    const getStatisticApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/statistic`

    try {
      const response = await fetch(getStatisticApi, {
        method: "GET",
      })
      if (!response.ok) {
        throw new Error("Send request failed")
      }

      const res = await response.json()
      setData(res.data)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Tổng thu nhập</p>
                  <h3 className="text-3xl font-bold text-gray-900">$15,500</h3>
                  <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +12.5%
                  </span>
                </div>
                <div className="h-16 w-16 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Plane className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expense */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Tổng chi phí</p>
                  <h3 className="text-3xl font-bold text-gray-900">$3,300</h3>
                  <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    -6.8%
                  </span>
                </div>
                <div className="h-16 w-16 bg-green-500 rounded-xl flex items-center justify-center">
                  <Plane className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Growth */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Tổng tăng trưởng</p>
                  <h3 className="text-3xl font-bold text-gray-900">$1,550</h3>
                  <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +12.5%
                  </span>
                </div>
                <div className="h-16 w-16 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bounce Rate */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Tỷ lệ thoát</p>
                  <h3 className="text-3xl font-bold text-gray-900">$2,100</h3>
                  <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    -6.8%
                  </span>
                </div>
                <div className="h-16 w-16 bg-blue-500 rounded-xl flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Reports */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Báo cáo bán hàng</CardTitle>
              <CardDescription className="text-sm text-gray-500">Theo dõi hiệu suất hàng tuần</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(value) => value.slice(0, 3)}
                    tick={{ fill: '#666', fontSize: 12 }}
                    stroke="#e0e0e0"
                  />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} stroke="#e0e0e0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Lượt xem"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#1e40af"
                    strokeWidth={2}
                    dot={{ fill: '#1e40af', r: 4 }}
                    name="Đơn hàng"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Page Views & Orders */}
          <div className="space-y-6">
            {/* Page Views Card */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Lượt xem trang</CardTitle>
                  <span className="text-2xl font-bold text-gray-900">3,277,320</span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={weeklyData}>
                    <Bar dataKey="pageViews" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders Card */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Đơn hàng</CardTitle>
                  <span className="text-2xl font-bold text-gray-900">3,074</span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={weeklyData}>
                    <Bar dataKey="orders" fill="#1e40af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Product Valuation and Event Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Valuation */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Định giá sản phẩm</CardTitle>
              <CardDescription className="text-sm text-gray-500">Phân tích giá trị theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => value.slice(0, 3)}
                    tick={{ fill: '#666', fontSize: 12 }}
                    stroke="#e0e0e0"
                  />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} stroke="#e0e0e0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="desktop" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Events Status */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Tình trạng sự kiện</CardTitle>
              <CardDescription className="text-sm text-gray-500">Phân phối theo loại sự kiện</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={aircraftData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {aircraftData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Year Overview */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Tổng quan năm</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Số sự kiện trong 12 tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => value.slice(0, 3)}
                  tick={{ fill: '#666', fontSize: 12 }}
                  stroke="#e0e0e0"
                />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} stroke="#e0e0e0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="desktop"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDesktop)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex w-full items-center gap-2 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Tăng 5.2% trong tháng này</span>
              </div>
              <span className="text-gray-400 ml-auto">January - December 2024</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}