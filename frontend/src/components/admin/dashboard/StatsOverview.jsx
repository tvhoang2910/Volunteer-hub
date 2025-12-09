
import React from 'react';
import { Users, Calendar, UserPlus, TrendingUp, Lock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function StatsOverview({ data }) {
    if (!data) return null;

    const stats = [
        {
            title: "Tổng số thành viên",
            value: data.totalMembers.toLocaleString(),
            trend: `+${data.memberGrowth}%`,
            icon: Users,
            gradient: "from-blue-500 to-blue-600",
            textColor: "text-blue-100"
        },
        {
            title: "Tổng số sự kiện",
            value: data.totalEvents.toLocaleString(),
            trend: `+${data.eventGrowth}%`,
            icon: Calendar,
            gradient: "from-emerald-500 to-emerald-600",
            textColor: "text-emerald-100"
        },
        {
            title: "Tỉ lệ tăng trưởng",
            value: `+${data.growthRate}%`,
            trend: `+${data.growthRateChange}%`,
            icon: UserPlus,
            gradient: "from-purple-500 to-purple-600",
            textColor: "text-purple-100"
        },
        {
            title: "Tài khoản bị khóa",
            value: data.lockedAccounts,
            trend: `${data.lockedAccountsChange}%`,
            icon: Lock,
            gradient: "from-rose-500 to-rose-600",
            textColor: "text-rose-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className={`bg-gradient-to-br ${stat.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className={`text-sm ${stat.textColor} font-medium mb-1`}>{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                                    <span className="inline-flex items-center text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
