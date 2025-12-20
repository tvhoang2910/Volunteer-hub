
import { Calendar, Award, MessageSquare, TrendingUp } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">{title}</span>
            <div className="p-2 bg-zinc-50 rounded-lg">
                <Icon className="w-5 h-5 text-zinc-900" />
            </div>
        </div>
        <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-zinc-900">{value}</span>
            {trend && <span className="text-xs text-emerald-600 font-medium mb-1">{trend}</span>}
        </div>
    </div>
);
