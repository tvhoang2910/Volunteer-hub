export const mockEvents = [
    {
        id: "EVT-001",
        name: "Chiến dịch làm sạch biển Vũng Tàu",
        category: "Môi trường",
        location: "Bãi Sau, Vũng Tàu",
        startDate: "2023-10-15",
        endDate: "2023-10-16",
        description: "Chiến dịch dọn dẹp rác thải nhựa dọc bờ biển, nâng cao ý thức bảo vệ môi trường biển.",
        createdBy: "Nguyễn Văn A",
        status: "APPROVED",
        volunteerCount: 150,
        pendingRegistrations: 5,
        createdAt: "2023-09-01",
        notes: "Đã duyệt, yêu cầu bổ sung kế hoạch an toàn."
    },
    {
        id: "EVT-002",
        name: "Dạy học cho trẻ em vùng cao",
        category: "Giáo dục",
        location: "Hà Giang",
        startDate: "2023-11-01",
        endDate: "2023-11-10",
        description: "Chương trình tình nguyện dạy tiếng Anh và Tin học cho trẻ em tiểu học tại các điểm trường khó khăn.",
        createdBy: "Trần Thị B",
        status: "PENDING",
        volunteerCount: 20,
        pendingRegistrations: 10,
        createdAt: "2023-10-05",
        notes: ""
    },
    {
        id: "EVT-003",
        name: "Hiến máu nhân đạo - Giọt hồng",
        category: "Y tế",
        location: "Đại học Bách Khoa",
        startDate: "2023-10-20",
        endDate: "2023-10-20",
        description: "Ngày hội hiến máu nhân đạo thường niên.",
        createdBy: "Lê Văn C",
        status: "REJECTED",
        volunteerCount: 0,
        pendingRegistrations: 0,
        createdAt: "2023-09-20",
        notes: "Thiếu giấy phép tổ chức từ cơ quan y tế."
    },
    {
        id: "EVT-004",
        name: "Trồng cây gây rừng",
        category: "Môi trường",
        location: "Vườn quốc gia Cúc Phương",
        startDate: "2023-12-05",
        endDate: "2023-12-07",
        description: "Hoạt động trồng 1000 cây xanh.",
        createdBy: "Phạm Thị D",
        status: "PENDING",
        volunteerCount: 50,
        pendingRegistrations: 2,
        createdAt: "2023-10-10",
        notes: ""
    },
    {
        id: "EVT-005",
        name: "Hỗ trợ người già neo đơn",
        category: "Xã hội",
        location: "Viện dưỡng lão Hà Nội",
        startDate: "2023-10-25",
        endDate: "2023-10-25",
        description: "Thăm hỏi và tặng quà cho người già neo đơn.",
        createdBy: "Hoàng Văn E",
        status: "DELETED",
        volunteerCount: 0,
        pendingRegistrations: 0,
        createdAt: "2023-09-15",
        notes: "Đã bị xóa do trùng lặp nội dung."
    }
];

export const mockRegistrations = [
    { id: "REG-01", volunteerName: "Phan Văn X", email: "x@gmail.com", status: "APPROVED" },
    { id: "REG-02", volunteerName: "Đỗ Thị Y", email: "y@gmail.com", status: "PENDING" },
    { id: "REG-03", volunteerName: "Ngô Văn Z", email: "z@gmail.com", status: "REJECTED" },
];
