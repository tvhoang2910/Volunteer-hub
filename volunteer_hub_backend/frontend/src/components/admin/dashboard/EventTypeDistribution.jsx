
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function EventTypeDistribution({ data }) {
    if (!data) return null;

    return (
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-900">Phân loại sự kiện</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">Phân bố theo loại hình hoạt động</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.value} sự kiện</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
