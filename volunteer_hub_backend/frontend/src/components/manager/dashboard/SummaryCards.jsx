
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default function SummaryCards({ stats }) {
    const summaryItems = [
        {
            title: "Tổng sự kiện",
            value: stats.totalEvents,
            desc: "Sự kiện đã tổ chức",
        },
        {
            title: "Tổng thành viên",
            value: stats.totalMembers,
            desc: "Người tham gia các hoạt động",
        },
        {
            title: "Bài viết gần đây",
            value: stats.recentPosts,
            desc: "Tin bài & trao đổi mới",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summaryItems.map((item, i) => (
                <Card
                    key={i}
                    className="bg-white/80 border border-emerald-100 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] duration-300 rounded-2xl"
                >
                    <CardHeader>
                        <CardTitle className="text-emerald-600">{item.title}</CardTitle>
                        <CardDescription className="text-3xl font-bold text-gray-900">
                            {item.value}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-gray-500">{item.desc}</CardContent>
                </Card>
            ))}
        </div>
    );
}
