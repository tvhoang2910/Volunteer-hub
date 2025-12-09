
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EventsFrequencyChart({ data }) {
    if (!data) return null;

    return (
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-900">Số sự kiện được tạo</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">Phân tích theo từng tháng trong năm</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
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
                        <Bar dataKey="desktop" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
