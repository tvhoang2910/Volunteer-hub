
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const INTERACTION_ICONS = {
    post: { icon: FileText, color: 'text-blue-500 bg-blue-50' },
    comment: { icon: MessageSquare, color: 'text-green-500 bg-green-50' },
    like: { icon: Heart, color: 'text-pink-500 bg-pink-50' }
};

export const InteractionCard = ({ item }) => {
    const config = INTERACTION_ICONS[item.type] || INTERACTION_ICONS.post;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 p-4 rounded-xl bg-white border border-zinc-100 hover:border-emerald-100 hover:shadow-md transition-all group"
        >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", config.color)}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                            {item.type === 'like' && <span className="font-normal text-zinc-500">Đã thích bài viết của </span>}
                            {item.type === 'like' ? <span className="font-semibold">{item.author}</span> : item.content}
                        </p>
                        {item.type === 'like' && (
                            <p className="text-xs text-zinc-500 mt-1 italic">&quot;{item.content}&quot;</p>
                        )}
                    </div>
                    <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
                        {format(new Date(item.date), 'dd/MM HH:mm')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-normal bg-zinc-50 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer">
                        #{item.relatedEvent}
                    </Badge>
                </div>

                {item.type === 'post' && (
                    <div className="flex items-center gap-4 pt-1">
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Heart className="w-3 h-3" /> {item.likes}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <MessageSquare className="w-3 h-3" /> {item.comments}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
