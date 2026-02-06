
import { format } from 'date-fns';

export const TimelineItem = ({ date, label }) => (
    <div className="flex flex-col items-center min-w-[100px] relative z-10">
        <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm mb-1" />
        <span className="text-[10px] text-zinc-400 font-medium uppercase">{label}</span>
        <span className="text-xs text-zinc-700 font-semibold">{format(new Date(date), 'dd/MM/yyyy')}</span>
    </div>
);
