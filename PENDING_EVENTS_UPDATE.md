# Cập nhật: Hiển thị sự kiện đang chờ duyệt trên trang Landing Page

## Tóm tắt thay đổi

Đã điều chỉnh hệ thống để sau khi manager tạo sự kiện, sự kiện sẽ:

1. ✅ Hiển thị ở phần "Đang chờ duyệt" trên trang landing page công khai
2. ✅ Tự động gửi thông báo đến admin để chấp nhận

## Chi tiết thay đổi

### 1. Backend (Đã có sẵn - Không cần sửa)

Backend đã được thiết kế sẵn với các chức năng sau:

**File: `EventServiceImpl.java`**

- Khi tạo sự kiện, status tự động được set là `PENDING` (line 163)
- Hàm `notifyAdminsPendingEvent()` (line 557-584) tự động gửi thông báo cho tất cả admin
- Endpoint `/api/events?status=PENDING` hỗ trợ lấy danh sách sự kiện đang chờ duyệt

### 2. Frontend - Các file mới tạo/sửa đổi

#### 2.1. File mới: `PendingEvents.jsx`

**Đường dẫn:** `frontend/src/components/landing/PendingEvents.jsx`

Component mới để hiển thị danh sách sự kiện đang chờ duyệt:

- Hiển thị card với badge "Đang chờ duyệt" màu vàng/amber
- Tự động ẩn nếu không có sự kiện pending
- Responsive design với grid layout
- Animations với AOS library
- Disable nút đăng ký vì sự kiện chưa được duyệt

#### 2.2. Cập nhật: `eventService.js`

**Đường dẫn:** `frontend/src/services/eventService.js`

Thêm function mới:

```javascript
getPendingEvents: async (page = 1, limit = 9) => {
  // Gọi API /api/events?status=PENDING
  // Trả về danh sách sự kiện đang chờ duyệt
};
```

#### 2.3. Cập nhật: `index.jsx` (Landing Page)

**Đường dẫn:** `frontend/src/pages/index.jsx`

- Import component `PendingEvents`
- Thêm section mới giữa "Destination" và "About"
- Sử dụng gradient màu amber để phân biệt với các section khác

## Flow hoạt động

```
┌─────────────────────────────────────────────────────────────────┐
│                    Manager tạo sự kiện                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│         Backend: EventServiceImpl.createEvent()                │
│  - Set status = PENDING                                        │
│  - Lưu vào database                                           │
│  - Gọi notifyAdminsPendingEvent()                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
         ┌───────────────┴───────────────┐
         │                               │
         ↓                               ↓
┌─────────────────────┐     ┌──────────────────────────┐
│  Gửi notification   │     │ Sự kiện được lưu với    │
│  đến tất cả Admin   │     │ status = PENDING        │
│  (trong database)   │     │                         │
└─────────────────────┘     └──────────┬───────────────┘
                                       │
                                       ↓
                         ┌─────────────────────────────┐
                         │ Landing Page hiển thị       │
                         │ sự kiện trong section       │
                         │ "Đang chờ duyệt"           │
                         │ (PendingEvents component)   │
                         └─────────────────────────────┘
                                       │
                                       ↓
                         ┌─────────────────────────────┐
                         │ Admin vào dashboard,        │
                         │ xem notification và         │
                         │ phê duyệt/từ chối          │
                         └─────────────────────────────┘
                                       │
                                       ↓
                         ┌─────────────────────────────┐
                         │ Sau khi APPROVED:           │
                         │ - Hiển thị ở section chính  │
                         │ - User có thể đăng ký       │
                         └─────────────────────────────┘
```

## Notification cho Admin

### Backend tự động tạo notification với:

- **Title**: "Sự kiện mới chờ duyệt"
- **Body**: "Sự kiện "{tên_sự_kiện}" do {tên_manager} vừa tạo đang chờ duyệt."
- **Type**: `EVENT_CREATED_PENDING`
- **Recipients**: Tất cả admin đang active

### Admin có thể:

1. Xem danh sách notification trong dashboard
2. Click vào notification để xem chi tiết sự kiện
3. Phê duyệt (Approve) hoặc Từ chối (Reject) sự kiện

## Kiểm tra thay đổi

### 1. Test tạo sự kiện từ Manager:

```bash
# Đăng nhập với tài khoản Manager
# Vào trang /manager/events/create
# Tạo một sự kiện mới
```

### 2. Kiểm tra hiển thị trên Landing Page:

```bash
# Mở trang chủ (/)
# Scroll xuống, sẽ thấy section "Sự kiện chờ duyệt"
# với border màu vàng và badge "Đang chờ duyệt"
```

### 3. Kiểm tra notification cho Admin:

```bash
# Đăng nhập với tài khoản Admin
# Vào dashboard, check notifications
# Sẽ thấy thông báo về sự kiện mới cần duyệt
```

## Các API endpoint liên quan

- `POST /api/events/{creatorId}` - Tạo sự kiện mới
- `GET /api/events?status=PENDING` - Lấy danh sách sự kiện pending
- `GET /api/events?status=APPROVED` - Lấy danh sách sự kiện đã duyệt
- `PUT /api/admin/events/{eventId}/approve` - Admin phê duyệt sự kiện
- `PUT /api/admin/events/{eventId}/reject` - Admin từ chối sự kiện

## Notes

- Section "Sự kiện chờ duyệt" chỉ hiển thị khi có sự kiện pending (tự động ẩn nếu không có)
- Sự kiện pending không thể đăng ký - button bị disable
- Sau khi admin approve, sự kiện sẽ tự động chuyển sang section "Sự kiện nổi bật" và user có thể đăng ký
- Notification được lưu trong database và có thể xem lại bất cứ lúc nào

## Files đã thay đổi

### Frontend:

1. ✅ `frontend/src/components/landing/PendingEvents.jsx` (Mới)
2. ✅ `frontend/src/services/eventService.js` (Thêm function getPendingEvents)
3. ✅ `frontend/src/pages/index.jsx` (Import và hiển thị PendingEvents)

### Backend:

- Không cần thay đổi (đã có sẵn tất cả logic cần thiết)
