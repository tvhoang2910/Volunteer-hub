export const mockUsers = [
    {
        id: "USR-001",
        fullName: "Nguyễn Văn Tình Nguyện",
        email: "tinhnguyen@example.com",
        role: "VOLUNTEER",
        status: "ACTIVE",
        joinedAt: "2023-01-15",
        totalEvents: 12,
        totalPosts: 5,
        totalComments: 20,
        violationHistory: [],
        lockHistory: []
    },
    {
        id: "USR-002",
        fullName: "Trần Quản Lý",
        email: "quanly@example.com",
        role: "EVENT_MANAGER",
        status: "ACTIVE",
        joinedAt: "2023-02-20",
        totalEvents: 5, // Organised
        totalPosts: 10,
        totalComments: 50,
        violationHistory: [],
        lockHistory: []
    },
    {
        id: "USR-003",
        fullName: "Lê Bị Khóa",
        email: "bikhoa@example.com",
        role: "VOLUNTEER",
        status: "LOCKED",
        joinedAt: "2023-03-10",
        totalEvents: 2,
        totalPosts: 0,
        totalComments: 1,
        violationHistory: [{ date: "2023-05-01", reason: "Spam comment" }],
        lockHistory: [{ date: "2023-05-02", reason: "Vi phạm quy tắc cộng đồng nhiều lần" }]
    },
    {
        id: "USR-004",
        fullName: "Phạm Tích Cực",
        email: "tichcuc@example.com",
        role: "VOLUNTEER",
        status: "ACTIVE",
        joinedAt: "2023-04-05",
        totalEvents: 25,
        totalPosts: 15,
        totalComments: 100,
        violationHistory: [],
        lockHistory: []
    },
    {
        id: "USR-005",
        fullName: "Hoàng Mới Com",
        email: "moi@example.com",
        role: "EVENT_MANAGER",
        status: "ACTIVE",
        joinedAt: "2023-10-01",
        totalEvents: 0,
        totalPosts: 0,
        totalComments: 0,
        violationHistory: [],
        lockHistory: []
    }
];
