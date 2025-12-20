export const MOCK_PROFILE = {
    id: "mgr-001",
    name: "Nguyễn Văn A",
    role: "Manager",
    avatarUrl:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
    email: "manager@example.org",
    phone: "+84 912 345 678",
    organization: "Volunteer Hub VN",
    location: "Hà Nội, Việt Nam",
    bio: "Tôi là trưởng nhóm tình nguyện, phụ trách điều phối các dự án cộng đồng.",
    stats: { managedProjects: 3, volunteers: 128 },
    preferences: { emailNotifications: true, smsNotifications: false, inApp: true },
};

export const MONTHLY_STATS = [
    { month: "Tháng 5", events: 5, members: 320, posts: 10 },
    { month: "Tháng 6", events: 6, members: 400, posts: 15 },
    { month: "Tháng 7", events: 7, members: 450, posts: 22 },
    { month: "Tháng 8", events: 8, members: 600, posts: 25 },
    { month: "Tháng 9", events: 5, members: 530, posts: 18 },
    { month: "Tháng 10", events: 9, members: 750, posts: 30 },
];

export const MOCK_NEW_EVENTS = [
    {
        id: 1,
        title: "Trồng cây ven sông",
        publishedAt: "2025-11-01",
        posts: 2,
        members: 120,
    },
    {
        id: 2,
        title: "Dọn rác bãi biển",
        publishedAt: "2025-10-28",
        posts: 5,
        members: 230,
    },
    {
        id: 3,
        title: "Giúp đỡ trẻ em",
        publishedAt: "2025-10-25",
        posts: 1,
        members: 80,
    },
];

export const MOCK_TRENDING = [
    { id: 2, title: "Dọn rác bãi biển", deltaMembers: 120, deltaLikes: 40 },
    { id: 1, title: "Trồng cây ven sông", deltaMembers: 50, deltaLikes: 10 },
];

export const NOTIFICATIONS_SEED = [
    { id: "1", title: 'Dự án "Trồng cây ven sông" đã được duyệt', body: "Admin Lê Thu Hà đã duyệt bản kế hoạch cập nhật.", time: "2 giờ trước", status: "approved" },
    { id: "2", title: 'Dự án "Không đồng hành một mình" bị gỡ', body: "Thiếu báo cáo ngân sách tháng 10. Nộp bổ sung trước 12/11.", time: "5 giờ trước", status: "removed", requiresAction: true, sla: "12h" },
    { id: "3", title: 'Tạo sự kiện "Tập huấn sơ cứu" thành công', body: "Lịch gửi email tuyển tình nguyện viên đã mở.", time: "Hôm nay, 09:15", status: "success" },
    { id: "4", title: "Thành viên mới xin tham gia dự án", body: "Trần Đức Long muốn tham gia dự án “Bếp ấm đêm đông”.", time: "10 phút trước", status: "pending", requiresAction: true, sla: "6h" },
    { id: "5", title: 'Nhắc lịch: "Phiên chợ 0 đồng" sáng mai', body: "Kiểm tra lại danh sách quà tặng và phân công nhóm hậu cần.", time: "Ngày mai • 06:00", status: "warning", requiresAction: true },
    { id: "6", title: 'Sự kiện "Dọn rác Hồ Tây" sắp diễn ra', body: "Cần chốt phương án vận chuyển dụng cụ.", time: "12/11/2025 • 07:30", status: "upcoming", requiresAction: true },
    { id: "7", title: 'Sự kiện "Dạy STEM cho trẻ" đã kết thúc', body: "Hoàn thiện báo cáo trong 3 ngày để nhận ngân sách đợt tiếp.", time: "08/11/2025 • 18:00", status: "completed" },
    { id: "8", title: "Nhắc nhở nộp biên bản họp tháng", body: "Hạn nộp 17:00 hôm nay.", time: "1 giờ trước", status: "warning", requiresAction: true, sla: "6h" },
    { id: "9", title: "Checklist hậu cần đã đạt 80%", body: "Cần bổ sung phương án dự phòng thời tiết.", time: "Hôm qua, 20:45", status: "success" },
];

export const WALL_GROUPS = [
    {
        id: "g1",
        name: "Trồng cây ven sông",
        cover:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/women/26.jpg",
        status: "đang diễn ra",
        activityCount: 12,
    },
    {
        id: "g2",
        name: "Phiên chợ 0 đồng",
        cover:
            "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
        status: "đã kết thúc",
        activityCount: 8,
    },
];

export const WALL_POSTS = [
    {
        id: "p1",
        group: { id: "g1", name: "Trồng cây ven sông", avatar: WALL_GROUPS[0].avatar },
        author: "Nguyễn Hoài An",
        time: "15 phút trước",
        createdAt: "2025-11-12T00:50:00.000Z",
        lastCommentAt: "2025-11-12T01:05:00.000Z",
        content:
            "Admin đã duyệt bổ sung kinh phí, nhóm có thể đặt thêm 40 cây sao đen 🌱. Cần 6 TNV phụ trách vận chuyển vào sáng thứ 7!",
        media:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
        tags: ["moitruong", "volunteer"],
        stats: { likes: 58, comments: 14 },
    },
    {
        id: "p2",
        group: { id: "g2", name: "Phiên chợ 0 đồng", avatar: WALL_GROUPS[1].avatar },
        author: "Lưu Gia Khánh",
        time: "1 giờ trước",
        createdAt: "2025-11-11T23:55:00.000Z",
        lastCommentAt: "2025-11-12T00:10:00.000Z",
        content:
            "Checklist mới cho phiên chợ đã cập nhật lên drive. Mọi người kiểm tra lại bàn giao vật phẩm, nhóm quần áo trẻ em lưu ý!",
        tags: ["phiencho", "checklist"],
        stats: { likes: 35, comments: 9 },
    },
];

export const WALL_NOTIFICATIONS = [
    { title: "Nhóm Trồng cây ven sông có 5 bài mới", subtitle: "5 bài đăng chưa đọc từ thành viên" },
    { title: "Sự kiện Dạy STEM sắp diễn ra", subtitle: "16/11 • 14:00 — 2 ngày nữa" },
];

export const MANAGED_EVENTS_SEED = [
    {
        title: "2026 Schwarz Park Maintenance Volunteer",
        location: "Dorena Lake, Oregon",
        date: "2026-04-01 - 2026-09-30",
        img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
        status: "approved",
    },
    {
        title: "Community Tree Planting",
        location: "Hà Nội, Việt Nam",
        date: "2026-04-24 - 2026-10-01",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdp4H-EXyavAgCcgpheUMGYjpdkGjfSMjfFA&s",
        status: "approved",
    },
];

export const PENDING_EVENTS_SEED = [
    {
        title: "Clean City Campaign",
        location: "TP. Hồ Chí Minh, Việt Nam",
        date: "2026-05-06 - 2026-05-10",
        img: "https://en-cdn.nhandan.vn/images/690c590d50fc5d3afa89e2f20ddc864a03eef7b60560d70ed04a42615367b47681764174b35edea27af880c27a9f0fa2/bm1.jpg",
        status: "pending",
    },
];
