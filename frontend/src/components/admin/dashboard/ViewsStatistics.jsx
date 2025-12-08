
import React from 'react';
import { Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

export function ViewsStatistics({ data }) {
    if (!data) return null;

    // Calculate total views if needed, or use a prop. 
    // For now hardcoding the summary logic as per original visual 
    // or we can calculate from data.
    // Original had hardcoded "3,277,320".

    return (
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Lượt xem</CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-1">Tổng lượt xem sự kiện</CardDescription>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="mb-4">
                    <h3 className="text-4xl font-bold text-gray-900">3,277,320</h3>
                    <p className="text-sm text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        +15.3% so với tuần trước
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data}>
                        <Bar dataKey="pageViews" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
