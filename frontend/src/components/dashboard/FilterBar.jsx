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
            <div className="flex flex-col gap-4 sm:gap-5">

                {/* SEARCH BAR */}
                <div className="w-full">
                    <SearchBar
                        className="w-full bg-zinc-50/60 dark:bg-zinc-800/60 
                                   backdrop-blur-md border border-zinc-300/60 
                                   dark:border-zinc-700/60 rounded-xl text-sm sm:text-base"
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
                <div className="grid grid-cols-2 md:flex md:flex-wrap md:items-center gap-2 sm:gap-3 w-full">

                    {/* DATE RANGE */}
                    <div className="col-span-2 md:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-zinc-50/70 dark:bg-zinc-800/50
                                    backdrop-blur-lg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-zinc-200/50 
                                    dark:border-zinc-700/50 shadow-sm">
                        {/* Start Date */}
                        <div className="relative flex-1 sm:flex-none">
                            <CalendarIcon className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500/70" />
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters(prev => ({ ...prev, startDate: e.target.value }))
                                }
                                className="pl-6 sm:pl-8 pr-1 py-1 sm:py-1.5 bg-transparent text-xs sm:text-sm w-full sm:w-[130px]
                                           focus:outline-none text-zinc-700 dark:text-zinc-300"
                            />
                        </div>

                        <span className="text-zinc-400 text-xs sm:text-sm">→</span>

                        {/* End Date */}
                        <div className="relative flex-1 sm:flex-none">
                            <CalendarIcon className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500/70" />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters(prev => ({ ...prev, endDate: e.target.value }))
                                }
                                className="pl-6 sm:pl-8 pr-1 py-1 sm:py-1.5 bg-transparent text-xs sm:text-sm w-full sm:w-[130px]
                                           focus:outline-none text-zinc-700 dark:text-zinc-300"
                            />
                        </div>
                    </div>

                    {/* CATEGORY */}
                    <div className="col-span-1 md:w-auto">
                        <Select
                            value={filters.category}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                        >
                            <SelectTrigger className="w-full md:w-[175px] bg-zinc-50/70 dark:bg-zinc-800/50 
                                                     backdrop-blur-lg border border-zinc-200/50 
                                                     dark:border-zinc-700/50 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                <Tag size={14} className="sm:w-4 sm:h-4 text-purple-500/70" />
                                <SelectValue placeholder="Thể loại" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Tất cả thể loại</SelectItem>
                                {categories.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* LOCATION */}
                    <div className="col-span-1 md:w-auto">
                        <Select
                            value={filters.location}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                        >
                            <SelectTrigger className="w-full md:w-[150px] bg-zinc-50/70 dark:bg-zinc-800/50 
                                                     backdrop-blur-lg border border-zinc-200/50 
                                                     dark:border-zinc-700/50 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                <MapPin size={14} className="sm:w-4 sm:h-4 text-red-500/70" />
                                <SelectValue placeholder="Địa điểm" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                                {locations.map(loc => (
                                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* RESET */}
                    {hasActiveFilters && (
                        <div className="col-span-2 md:w-auto">
                            <button
                                onClick={onReset}
                                className="w-full md:w-auto px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl text-xs sm:text-sm
                                           bg-red-100/70 dark:bg-red-900/30 
                                           text-red-700 dark:text-red-300 
                                           border border-red-200/50 dark:border-red-800/50 
                                           hover:bg-red-200/70 dark:hover:bg-red-900/50 transition"
                            >
                                <X size={14} className="sm:w-4 sm:h-4" />
                                <span>Xóa lọc</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* QUICK FILTER TAGS */}
            <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['Workshop', 'Webinar', 'Tech Talk'].map(tag => {
                    const isActive = filters.category === tag;
                    return (
                        <button
                            key={tag}
                            onClick={() => setFilters(prev => ({ ...prev, category: tag }))}
                            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap
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
