import React from 'react';
import { BarChart3, Users, CalendarCheck, TrendingUp } from 'lucide-react';

const AnalyticsCard = ({ events }) => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => new Date(e.start_time) > new Date()).length;
    const registeredEvents = events.filter(e => e.registered).length;

    // Mock monthly data for the mini chart
    const monthlyData = [4, 6, 3, 8, 5, 9];
    const maxVal = Math.max(...monthlyData);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <CalendarCheck size={24} />
                </div>
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Tổng sự kiện</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalEvents}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Sắp diễn ra</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{upcomingEvents}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Đã đăng ký</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{registeredEvents}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Sự kiện theo tháng</p>
                    <BarChart3 size={16} className="text-zinc-400" />
                </div>
                <div className="flex items-end gap-1 h-10">
                    {monthlyData.map((val, idx) => (
                        <div
                            key={idx}
                            className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-t-sm hover:bg-blue-500 transition-colors"
                            style={{ height: `${(val / maxVal) * 100}%` }}
                            title={`Tháng ${idx + 1}: ${val}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;
