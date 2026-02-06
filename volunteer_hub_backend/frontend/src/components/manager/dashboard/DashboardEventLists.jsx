
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Flame } from "lucide-react";

export default function DashboardEventLists({ newEvents, trending }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 border border-gray-200 rounded-2xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-emerald-600">
                        Sự kiện mới công bố
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {newEvents.map((ev) => (
                            <li
                                key={ev.id}
                                className="p-4 bg-emerald-50 hover:bg-emerald-100 transition-all rounded-xl shadow-sm flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-semibold text-gray-800">
                                        {ev.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Đăng: {ev.publishedAt} • {ev.posts} tin
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-emerald-600">
                                    {ev.members} thành viên
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 via-rose-50 to-yellow-50 border border-orange-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-orange-600 flex items-center gap-2 text-lg font-bold">
                        <Flame className="text-orange-500 animate-pulse" size={22} />
                        Sự kiện thu hút (Trending)
                    </CardTitle>
                    <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                        Cập nhật mới nhất
                    </span>
                </CardHeader>

                <CardContent>
                    <ul className="space-y-4">
                        {trending.map((ev, i) => (
                            <li
                                key={ev.id}
                                className={`
        relative overflow-hidden p-5 rounded-xl border transition-all duration-300
        ${i % 2 === 0
                                        ? "bg-gradient-to-r from-orange-100/80 to-rose-100/80"
                                        : "bg-gradient-to-r from-yellow-100/80 to-orange-50/80"
                                    }
        hover:scale-[1.02] hover:shadow-md group
      `}
                            >
                                <div className="flex justify-between items-center">
                                    {/* Thông tin sự kiện */}
                                    <div>
                                        <div className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                                            {ev.title}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            +{ev.deltaMembers} thành viên • +{ev.deltaLikes} lượt
                                            tương tác
                                        </div>
                                    </div>

                                    {/* Biểu tượng HOT */}
                                    <div className="flex items-center gap-1 font-extrabold animate-bounce">
                                        <Flame
                                            className="text-orange-500 animate-flicker drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]"
                                            size={18}
                                        />
                                        <span className="uppercase tracking-wide bg-clip-text text-orange-500 bg-gradient-to-r from-orange-500 to-red-500">
                                            HOT
                                        </span>
                                    </div>
                                </div>

                                {/* Thanh nhiệt huyết hiển thị mức độ */}
                                <div className="mt-3 h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-grow"
                                        style={{
                                            width: `${Math.min(
                                                (ev.deltaMembers + ev.deltaLikes) / 3,
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
