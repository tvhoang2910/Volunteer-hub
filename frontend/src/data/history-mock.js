
// Mock data for user history
export const MOCK_EVENTS = [
    {
        id: 'EVT001',
        name: 'Chiến dịch Mùa Hè Xanh 2025 - Mặt trận Long An',
        date: '2025-07-15T07:00:00',
        location: 'Huyện Cần Giuộc, Long An',
        category: 'Tình nguyện xa',
        status: 'completed', // registered, pending, approved, cancelled, completed, not_participating, absent
        timeline: {
            registered: '2025-06-01T10:30:00',
            approved: '2025-06-05T14:20:00',
            completed: '2025-07-20T17:00:00'
        }
    },
    {
        id: 'EVT002',
        name: 'Hiến máu nhân đạo - Giọt hồng sẻ chia',
        date: '2025-08-10T08:00:00',
        location: 'Sảnh A, Đại học Q',
        category: 'Hiến máu',
        status: 'registered',
        timeline: {
            registered: '2025-08-01T09:00:00'
        }
    },
    {
        id: 'EVT003',
        name: 'Dọn dẹp bãi biển Vũng Tàu',
        date: '2025-05-20T06:00:00',
        location: 'Bãi Sau, Vũng Tàu',
        category: 'Môi trường',
        status: 'cancelled',
        timeline: {
            registered: '2025-05-10T11:00:00',
            cancelled: '2025-05-18T20:00:00'
        }
    },
    {
        id: 'EVT004',
        name: 'Hỗ trợ kỳ thi THPT Quốc Gia',
        date: '2025-06-28T06:30:00',
        location: 'THPT Nguyễn Thượng Hiền',
        category: 'Tiếp sức mùa thi',
        status: 'approved',
        timeline: {
            registered: '2025-06-15T15:00:00',
            approved: '2025-06-20T10:00:00'
        }
    },
    {
        id: 'EVT005',
        name: 'Tập huấn kỹ năng sơ cấp cứu',
        date: '2025-04-10T13:30:00',
        location: 'Hội trường B',
        category: 'Tập huấn',
        status: 'absent',
        timeline: {
            registered: '2025-04-01T08:00:00',
            approved: '2025-04-05T09:00:00'
        }
    },
    {
        id: 'EVT006',
        name: 'Quyên góp sách vở cho trẻ em vùng cao',
        date: '2025-09-05T08:00:00',
        location: 'Văn phòng Đoàn',
        category: 'Quyên góp',
        status: 'pending',
        timeline: {
            registered: '2025-09-01T10:00:00'
        }
    }
];

export const MOCK_INTERACTIONS = [
    {
        id: 'INT001',
        type: 'post', // post, comment, like
        content: 'Hôm nay thật vui khi được tham gia chiến dịch Mùa Hè Xanh cùng mọi người! #MuaHeXanh',
        date: '2025-07-20T19:00:00',
        likes: 45,
        comments: 12,
        relatedEvent: 'Chiến dịch Mùa Hè Xanh 2025',
        link: '#'
    },
    {
        id: 'INT002',
        type: 'comment',
        content: 'Tuyệt vời quá bạn ơi, hẹn gặp lại ở chiến dịch sau nhé!',
        date: '2025-07-21T09:30:00',
        relatedEvent: 'Chiến dịch Mùa Hè Xanh 2025',
        link: '#'
    },
    {
        id: 'INT003',
        type: 'like',
        content: 'Bài viết về lễ ra quân Tiếp sức mùa thi',
        author: 'Nguyễn Văn A',
        date: '2025-06-29T10:00:00',
        relatedEvent: 'Hỗ trợ kỳ thi THPT Quốc Gia',
        link: '#'
    },
    {
        id: 'INT004',
        type: 'post',
        content: 'Cần tìm 2 bạn hỗ trợ khu vực check-in vào sáng mai ạ.',
        date: '2025-08-09T20:00:00',
        likes: 5,
        comments: 8,
        relatedEvent: 'Hiến máu nhân đạo - Giọt hồng sẻ chia',
        link: '#'
    }
];
