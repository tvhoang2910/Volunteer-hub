
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function YearlyGrowthChart({ data }) {
    if (!data) return null;

    return (
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Tổng quan cả năm</CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-1">
                            Biểu đồ số lượng sự kiện trong 12 tháng
                        </CardDescription>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg font-medium">
                        January - December 2024
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="month"
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
                        <Area
                            type="monotone"
                            dataKey="desktop"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorDesktop)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4 bg-gray-50">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-emerald-600">Tăng 5.2%</p>
                            <p className="text-xs text-gray-500">So với tháng trước</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">1,450</p>
                        <p className="text-xs text-gray-500">Tổng sự kiện năm nay</p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
