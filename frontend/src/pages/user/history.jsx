
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Search,
    MessageSquare,
    Award,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Custom Components & Hooks
import { useHistory, useHistoryFilter } from '@/hooks/useHistory';
import { StatCard } from '@/components/user/history/StatCard';
import { EventCard } from '@/components/user/history/EventCard';
import { InteractionCard } from '@/components/user/history/InteractionCard';

const HistoryPage = () => {
    const [activeTab, setActiveTab] = useState('events');

    // 1. Fetch Data
    const { events, interactions, stats, isLoading, error } = useHistory();

    // 2. Filter Logic
    const {
        filteredEvents,
        filteredInteractions,
        filters,
        clearFilters
    } = useHistoryFilter(events, interactions);

    const {
        dateRange, setDateRange,
        searchQuery, setSearchQuery,
        statusFilter, setStatusFilter,
        typeFilter, setTypeFilter
    } = filters;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/30 pt-8 pb-12 pl-64 pr-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50/30 pt-8 pb-12 pl-64 pr-6 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p>Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pt-8 pb-12 pl-16 pr-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Lịch sử hoạt động</h1>
                        <p className="text-zinc-500 mt-2">Theo dõi hành trình tình nguyện và tương tác của bạn</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Tìm kiếm..."
                                className="pl-9 w-64 bg-white border-zinc-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2 border-zinc-200 bg-white">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span>{dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Chọn ngày'}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Tổng sự kiện" value={stats.totalEvents} icon={CalendarIcon} />
                    <StatCard title="Hoàn thành" value={stats.completed} icon={Award} trend="+12% tháng này" />
                    <StatCard title="Tương tác" value={stats.interactions} icon={MessageSquare} />
                    <StatCard title="Tháng này" value={stats.thisMonth} icon={TrendingUp} trend="+2 new" />
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-1">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="events"
                                className="rounded-none bg-transparent border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-500 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 data-[state=active]:bg-transparent shadow-none"
                            >
                                Tham gia sự kiện ({filteredEvents.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="interactions"
                                className="rounded-none bg-transparent border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-500 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 data-[state=active]:bg-transparent shadow-none"
                            >
                                Lịch sử tương tác ({filteredInteractions.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500 font-medium">Lọc theo:</span>
                            {activeTab === 'events' ? (
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] bg-white border-zinc-200">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="registered">Đã đăng ký</SelectItem>
                                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                        <SelectItem value="cancelled">Đã huỷ</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[180px] bg-white border-zinc-200">
                                        <SelectValue placeholder="Loại tương tác" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả hoạt động</SelectItem>
                                        <SelectItem value="post">Bài viết</SelectItem>
                                        <SelectItem value="comment">Bình luận</SelectItem>
                                        <SelectItem value="like">Thích</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {(statusFilter !== 'all' || typeFilter !== 'all' || dateRange) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearFilters}
                                    className="text-zinc-400 hover:text-zinc-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <TabsContent value="events" className="space-y-4 min-h-[400px]">
                        {filteredEvents.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="text-zinc-900 font-medium">Không tìm thấy sự kiện nào</h3>
                                <p className="text-zinc-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm của bạn.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="interactions" className="space-y-4 min-h-[400px]">
                        {filteredInteractions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredInteractions.map(item => (
                                        <InteractionCard key={item.id} item={item} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="text-zinc-900 font-medium">Chưa có tương tác nào</h3>
                                <p className="text-zinc-500 text-sm mt-1">Hãy tham gia thảo luận trong các sự kiện nhé!</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default HistoryPage;