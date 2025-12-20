
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

const CHART_COLORS = ["#10B981", "#E8604C", "#06B6D4", "#F59E0B"];

export default function DashboardCharts({ monthlyStats, trending }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart */}
            <Card className="bg-white/90 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-emerald-600">
                        Thống kê hoạt động theo tháng
                    </CardTitle>
                    <CardDescription>
                        Biểu đồ tổng hợp số sự kiện, thành viên và bài viết
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="events"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                dot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="members"
                                stroke="#E8604C"
                                strokeWidth={2.5}
                                dot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="posts"
                                stroke="#06B6D4"
                                strokeWidth={2.5}
                                dot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="bg-white/90 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-emerald-600">
                        Tỷ lệ sự kiện theo mức độ tương tác
                    </CardTitle>
                    <CardDescription>
                        Phân bố lượt thành viên và tương tác
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={trending.map((ev) => ({
                                    name: ev.title,
                                    value: ev.deltaMembers + ev.deltaLikes,
                                }))}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label
                            >
                                {trending.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
