import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

const AnnounceDetail = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Giả sử bạn có một API để lấy thông báo
        fetch("/api/notifications")
            .then((response) => response.json())
            .then((data) => setNotifications(data))
            .catch((error) => {
                console.error("Error fetching notifications:", error);
                // Fallback data nếu API không hoạt động
                setNotifications([
                    {
                        id: 1,
                        title: "Thông báo mẫu",
                        date: "2024-01-01",
                        message: "Đây là một thông báo mẫu",
                        status: "Không"
                    },                    {
                        id: 1,
                        title: "Thông báo mẫu",
                        date: "2024-01-01",
                        message: "Đây là một thông báo mẫu",
                        status: "Không"
                    },                    {
                        id: 1,
                        title: "Thông báo mẫu",
                        date: "2024-01-01",
                        message: "Đây là một thông báo mẫu",
                        status: "Không"
                    },                    {
                        id: 1,
                        title: "Thông báo mẫu",
                        date: "2024-01-01",
                        message: "Đây là một thông báo mẫu",
                        status: "Không"
                    }
                    ,                    {
                        id: 1,
                        title: "Thông báo mẫu",
                        date: "2024-01-01",
                        message: "Đây là một thông báo mẫu",
                        status: "Không"
                    },
                    {
                        id: 1,
                        title: "Thông báo mẫu",
                        date: "2024-01-01",
                        message: "Đây là một thông báo mẫu",
                        status: "Không"
                    }
                ]);
            });
    }, []);

    return (
        <div className="space-y-4">
            {notifications.length === 0 ? (
                <Card className="p-6 text-center">
                    <CardContent>
                        <p className="text-gray-500">Không có thông báo nào</p>
                    </CardContent>
                </Card>
            ) : (
                notifications.map((notification) => (
                    <Card key={notification.id} className="mb-4 hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">{notification.title}</CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                                {notification.date}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">{notification.message}</p>
                        </CardContent>
                        <CardFooter>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                notification.status === 'Đã đọc' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {notification.status}
                            </span>
                        </CardFooter>
                    </Card>
                ))
            )}
        </div>
    );
};

export default AnnounceDetail;