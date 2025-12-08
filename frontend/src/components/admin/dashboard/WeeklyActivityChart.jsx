
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function WeeklyActivityChart({ data }) {
    if (!data) return null;

    return (
        <Card className="lg:col-span-2 bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Thống kê hoạt động</CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-1">Số lượng đăng ký và hoạt động gần đây</CardDescription>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Sự kiện mở</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-blue-800 rounded-full"></div>
                            <span className="text-gray-600">Sự kiện hủy</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickFormatter={(value) => value.slice(0, 3)}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#e5e7eb"
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#e5e7eb"
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="pageViews"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                            name="Sự kiện được mở"
                        />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#1e40af"
                            strokeWidth={3}
                            dot={{ fill: '#1e40af', r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                            name="Sự kiện bị hủy"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
