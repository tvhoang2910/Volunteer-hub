import React from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import SearchBar from "@/components/ui/search-bar";
import { X, Calendar as CalendarIcon, MapPin, Tag, Filter } from 'lucide-react';
import { motion } from "framer-motion";

const FilterBar = ({ filters, setFilters, onReset }) => {
    const categories = [
        "Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa",
        "Cộng đồng và xã hội", "Công nghệ và truyền thông xã hội"
    ];

    const locations = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Online"];

    const hasActiveFilters =
        filters.startDate ||
        filters.endDate ||
        filters.category !== 'all' ||
        filters.location !== 'all' ||
        filters.search;

    return (
        <motion.div
            whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="rounded-2xl p-6 mb-8 border backdrop-blur-xl 
                       bg-white/60 dark:bg-zinc-900/40 
                       border-white/30 dark:border-zinc-800/60 
                       shadow-lg shadow-black/5 dark:shadow-black/20"
        >
            <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">

                {/* SEARCH BAR */}
                <div className="w-full lg:w-1/3">
                    <SearchBar
                        className="w-full bg-zinc-50/60 dark:bg-zinc-800/60 
                                   backdrop-blur-md border border-zinc-300/60 
                                   dark:border-zinc-700/60 rounded-xl"
                        placeholder="🔍 Tìm kiếm sự kiện..."
                        value={filters.search}
                        onChange={(e) =>
                            setFilters(prev => ({ ...prev, search: e.target.value }))
                        }
                        onSearch={(value) =>
                            setFilters(prev => ({ ...prev, search: value }))
                        }
                    />
                </div>

                {/* FILTER OPTIONS */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">

                    {/* DATE RANGE */}
                    <div className="flex items-center gap-3 bg-zinc-50/70 dark:bg-zinc-800/50
                                    backdrop-blur-lg px-3 py-2 rounded-xl border border-zinc-200/50 
                                    dark:border-zinc-700/50 shadow-sm">
                        {/* Start Date */}
                        <div className="relative">
                            <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/70" />
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters(prev => ({ ...prev, startDate: e.target.value }))
                                }
                                className="pl-8 pr-2 py-1.5 bg-transparent text-sm w-[130px]
                                           focus:outline-none text-zinc-700 dark:text-zinc-300"
                            />
                        </div>

                        <span className="text-zinc-400">→</span>

                        {/* End Date */}
                        <div className="relative">
                            <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/70" />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters(prev => ({ ...prev, endDate: e.target.value }))
                                }
                                className="pl-8 pr-2 py-1.5 bg-transparent text-sm w-[130px]
                                           focus:outline-none text-zinc-700 dark:text-zinc-300"
                            />
                        </div>
                    </div>

                    {/* CATEGORY */}
                    <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    >
                        <SelectTrigger className="w-[175px] bg-zinc-50/70 dark:bg-zinc-800/50 
                                                 backdrop-blur-lg border border-zinc-200/50 
                                                 dark:border-zinc-700/50 rounded-xl flex items-center gap-2">
                            <Tag size={16} className="text-purple-500/70" />
                            <SelectValue placeholder="Thể loại" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">Tất cả thể loại</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* LOCATION */}
                    <Select
                        value={filters.location}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                    >
                        <SelectTrigger className="w-[150px] bg-zinc-50/70 dark:bg-zinc-800/50 
                                                 backdrop-blur-lg border border-zinc-200/50 
                                                 dark:border-zinc-700/50 rounded-xl flex items-center gap-2">
                            <MapPin size={16} className="text-red-500/70" />
                            <SelectValue placeholder="Địa điểm" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">Tất cả địa điểm</SelectItem>
                            {locations.map(loc => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* RESET */}
                    {hasActiveFilters && (
                        <button
                            onClick={onReset}
                            className="px-3 py-2 flex items-center gap-2 rounded-xl text-sm
                                       bg-red-100/70 dark:bg-red-900/30 
                                       text-red-700 dark:text-red-300 
                                       border border-red-200/50 dark:border-red-800/50 
                                       hover:bg-red-200/70 dark:hover:bg-red-900/50 transition"
                        >
                            <X size={16} />
                            Xóa lọc
                        </button>
                    )}
                </div>
            </div>

            {/* QUICK FILTER TAGS */}
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['Workshop', 'Webinar', 'Tech Talk'].map(tag => {
                    const isActive = filters.category === tag;
                    return (
                        <button
                            key={tag}
                            onClick={() => setFilters(prev => ({ ...prev, category: tag }))}
                            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap
                                transition shadow-sm ${isActive
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                                    : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                                }`}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default FilterBar;
