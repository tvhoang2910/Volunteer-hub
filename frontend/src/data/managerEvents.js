export const managerEventSections = [
  { key: "overview", label: "Thông tin chi tiết", href: "" },
  { key: "volunteers", label: "Danh sách tình nguyện viên", href: "/volunteers" },
  { key: "approvals", label: "Xác nhận đăng ký", href: "/approvals" },
  { key: "completion", label: "Đánh giá hoàn thành", href: "/completion" },
  { key: "exchange", label: "Kênh trao đổi", href: "/exchange" },
  { key: "reports", label: "Báo cáo & thống kê", href: "/reports" },
];

export const managerEvents = [
  {
    id: "0",
    title: "Trồng cây xanh vì cộng đồng",
    subtitle: "Chiến dịch mùa xuân 2026",
    location: "Hà Nội, Việt Nam",
    address: "Khuôn viên Đại học Quốc Gia Hà Nội",
    heroImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    tags: ["Môi trường", "Sinh viên", "Hỗ trợ cộng đồng"],
    timeline: { start: "20/03/2026", end: "25/03/2026" },
    organizer: { name: "Jane Doe", organization: "Green Earth Vietnam" },
    contact: { phone: "0123 456 789", email: "greenearth@volunteerhub.org" },
    mission:
      "Trong 500 cây xanh tại khu vực nội thành và chia sẻ kiến thức chăm sóc cây cho người dân.",
    description:
      "Dự án thuộc chuỗi hoạt động 'Xanh hơn mỗi ngày' của VolunteerHub. Mỗi nhóm tình nguyện viên phụ trách một cụm đường phố và được trang bị đầy đủ dụng cụ, cây giống và hướng dẫn kỹ năng.",
    requirements: [
      "Có thể tham gia toàn bộ thời gian dự án",
      "ẵn sàng làm việc ngoài trời và di chuyển nhiều",
      "Ưu tiên người có kinh nghiệm làm việc với trẻ em hoặc cộng đồng",
    ],
    volunteersNeeded: 60,
    status: "approved",
    volunteers: [
      {
        id: "vol-1",
        name: "Nguyen Minh Anh",
        role: "Truong nhom hien truong",
        hours: 24,
        status: "Da xac nhan",
        joinedAt: "12/02/2026",
        phone: "0901 222 333",
      },
      {
        id: "vol-2",
        name: "Tran Binh An",
        role: "Dieu phoi vien du an",
        hours: 20,
        status: "Da xac nhan",
        joinedAt: "15/02/2026",
        phone: "0988 667 221",
      },
      {
        id: "vol-3",
        name: "Le Hoang Ha",
        role: "Nhan su truyen thong",
        hours: 16,
        status: "Dang dao tao",
        joinedAt: "18/02/2026",
        phone: "0913 556 997",
      },
      {
        id: "vol-4",
        name: "Phan Gia Huy",
        role: "Hau can",
        hours: 12,
        status: "Cho xac nhan",
        joinedAt: "22/02/2026",
        phone: "0935 882 441",
      },
    ],
    pendingVolunteers: [
      {
        id: "pending-1",
        name: "Pham Quoc Huy",
        submittedAt: "05/03/2026",
        motivation:
          "Da tham gia 3 su kien trong cay truoc do va muon tiep tuc dong gop cho cong dong.",
      },
      {
        id: "pending-2",
        name: "Do Cam Tu",
        submittedAt: "06/03/2026",
        motivation:
          "Sinh vien nam 3, co kinh nghiem lam MC va muon tham gia huong dan tre em trong du an.",
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Khao sat dia diem va bo tri khu vuc trong",
        owner: "Team Duong pho",
        completed: true,
      },
      {
        id: "task-2",
        title: "Danh sach dung cu va dat hang vat tu",
        owner: "Team Hau can",
        completed: true,
      },
      {
        id: "task-3",
        title: "Dao tao ky nang an toan va huong dan quy trinh",
        owner: "Team Dao tao",
        completed: false,
      },
      {
        id: "task-4",
        title: "Phan cong nhom va xep lich tham gia",
        owner: "Team Dieu phoi",
        completed: false,
      },
    ],
    report: {
      progress: 78,
      hours: 184,
      satisfaction: 4.7,
      incidents: 0,
      highlights: [
        "Da huy dong du 48/60 tinh nguyen vien chi sau 2 tuan mo form.",
        "Doi tac cay giong da tai tro them 100 cay so voi ke hoach ban dau.",
      ],
      files: [
        { name: "Bao_cao_so_bo.pdf", updated: "02/03/2026" },
        { name: "Danh_sach_nhom.xlsx", updated: "28/02/2026" },
      ],
    },
  },
  {
    id: "1",
    title: "Schwarz Park Maintenance",
    subtitle: "Lake District 2026",
    location: "Dorena Lake, Oregon",
    address: "Khu vuc Schwarz Park, Dorena Lake",
    heroImage:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80",
    tags: ["Bao ton thien nhien", "Chuyen gia", "Lau dai"],
    timeline: { start: "01/04/2026", end: "30/09/2026" },
    organizer: { name: "Daniel Ruiz", organization: "US Forest Service" },
    contact: { phone: "+1 360 555 0192", email: "schwarzpark@volunteerhub.org" },
    mission:
      "Bao duong 12km duong mon dao, sua chua bien cam va lam sach khu cam trai quanh ho Dorena.",
    description:
      "Trong suot 6 thang, tinh nguyen vien lam viec theo ca cuoi tuan. Moi ca co truong nhom giam sat an toan va bao cao truc tiep cho quan ly cong vien.",
    requirements: [
      "Suc khoe tot, co the mang vac 15kg",
      "Tham gia toi thieu 2 cuoi tuan moi thang",
      "Hoan thanh khoa huan luyen an toan ngoai troi truoc khi bat dau",
    ],
    volunteersNeeded: 80,
    status: "approved",
    volunteers: [
      {
        id: "vol-6",
        name: "Megan Curtis",
        role: "Trail Captain",
        hours: 48,
        status: "Lead volunteer",
        joinedAt: "24/01/2026",
        phone: "+1 503 111 2233",
      },
      {
        id: "vol-7",
        name: "Carlos Ramirez",
        role: "Repair Specialist",
        hours: 36,
        status: "Da xac nhan",
        joinedAt: "01/02/2026",
        phone: "+1 503 551 8899",
      },
      {
        id: "vol-8",
        name: "Aya Nakamura",
        role: "Logistics",
        hours: 30,
        status: "Dang dao tao",
        joinedAt: "06/02/2026",
        phone: "+1 360 778 4411",
      },
    ],
    pendingVolunteers: [
      {
        id: "pending-4",
        name: "Luke Davenport",
        role: "Equipment tech",
        submittedAt: "02/03/2026",
        motivation: "Song gan cong vien va san sang tham gia cac ca chieu thu sau lam viec.",
      },
    ],
    tasks: [
      {
        id: "task-10",
        title: "Kiem tra he thong vieng tham quan",
        owner: "Ranger team",
        completed: true,
      },
      {
        id: "task-11",
        title: "Lap lich tuan tra an toan",
        owner: "Volunteer coordination",
        completed: true,
      },
      {
        id: "task-12",
        title: "Chuan bi kho dung cu",
        owner: "Logistics",
        completed: false,
      },
    ],
    report: {
      progress: 62,
      hours: 114,
      satisfaction: 4.5,
      incidents: 1,
      highlights: [
        "Hoan thanh 3km duong mon chi sau 4 ngay.",
        "Phat hien va xu ly kip thoi mot vung cay do.",
      ],
      files: [{ name: "Inspection_notes_March.pdf", updated: "03/03/2026" }],
    },
  },
];

export const getManagerEventByRouteId = (routeParam) => {
  if (routeParam === undefined) return null;
  const raw = Array.isArray(routeParam) ? routeParam[0] : routeParam;
  const index = Number(raw);
  if (Number.isNaN(index)) return null;
  return managerEvents[index] ?? null;
};
