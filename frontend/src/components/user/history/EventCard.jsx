
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, XCircle, Award, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TimelineItem } from './TimelineItem';

const EVENT_STATUS_CONFIG = {
    registered: { label: 'Đã đăng ký', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    pending: { label: 'Đang chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
    approved: { label: 'Được duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    cancelled: { label: 'Đã huỷ', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    completed: { label: 'Đã hoàn thành', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Award },
    not_participating: { label: 'Không tham gia', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
    absent: { label: 'Vắng mặt', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle }
};

export const EventCard = ({ event }) => {
    const statusConfig = EVENT_STATUS_CONFIG[event.status] || EVENT_STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-50/50 transition-all duration-300 relative overflow-hidden"
        >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50/50 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col md:flex-row gap-6 relative z-10 w-full">
                {/* Date Box */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-20 h-20 bg-zinc-50 rounded-xl border border-zinc-100 group-hover:bg-white group-hover:border-emerald-200 transition-colors">
                    <span className="text-xs font-semibold text-emerald-600 uppercase">Tháng {format(new Date(event.date), 'MM')}</span>
                    <span className="text-2xl font-bold text-zinc-900">{format(new Date(event.date), 'dd')}</span>
                    <span className="text-xs text-zinc-400">{format(new Date(event.date), 'yyyy')}</span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal bg-zinc-50 border-zinc-200 text-zinc-500">
                                    {event.category}
                                </Badge>
                                <Badge variant="secondary" className={cn("text-[10px] px-2 py-0.5 font-medium border", statusConfig.color)}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                </Badge>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                {event.name}
                            </h3>
                        </div>

                        {(event.status === 'registered' || event.status === 'pending') && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 h-8 text-xs">
                                Huỷ đăng ký
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            {format(new Date(event.date), 'HH:mm')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            {event.location}
                        </div>
                    </div>

                    {/* Timeline Mini */}
                    <div className="pt-4 mt-2 border-t border-zinc-50 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {event.timeline.registered && <TimelineItem date={event.timeline.registered} label="Đăng ký" />}
                        {event.timeline.approved && (
                            <>
                                <div className="h-px w-8 bg-emerald-200" />
                                <TimelineItem date={event.timeline.approved} label="Được duyệt" />
                            </>
                        )}
                        {event.timeline.completed && (
                            <>
                                <div className="h-px w-8 bg-emerald-200" />
                                <TimelineItem date={event.timeline.completed} label="Hoàn thành" />
                            </>
                        )}
                        {event.timeline.cancelled && (
                            <>
                                <div className="h-px w-8 bg-red-200" />
                                <div className="flex flex-col items-center min-w-[100px]">
                                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm mb-1" />
                                    <span className="text-[10px] text-zinc-400 font-medium uppercase">Đã huỷ</span>
                                    <span className="text-xs text-zinc-700 font-semibold">{format(new Date(event.timeline.cancelled), 'dd/MM/yyyy')}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
