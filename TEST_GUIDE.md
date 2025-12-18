# Hướng dẫn test chức năng mới

## 🎯 Chức năng đã thêm

Sau khi Manager tạo sự kiện:

1. Sự kiện hiển thị ở phần "Đang chờ duyệt" trên trang Landing Page
2. Admin nhận được thông báo để phê duyệt

---

## 📋 Các bước test

### Bước 1: Khởi động ứng dụng

**Terminal 1 - Backend:**

```bash
cd volunteer_hub_backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Đảm bảo:**

- Backend chạy ở: http://localhost:8080
- Frontend chạy ở: http://localhost:3000

---

### Bước 2: Tạo sự kiện với tài khoản Manager

1. **Đăng nhập Manager:**

   - Truy cập: http://localhost:3000/manager
   - Đăng nhập với tài khoản có role MANAGER

2. **Tạo sự kiện mới:**
   - Vào: http://localhost:3000/manager/events/create
   - Điền thông tin sự kiện:
     ```
     Tên sự kiện: Chiến dịch trồng cây xanh 2024
     Tỉnh/Thành: Hà Nội
     Địa chỉ: Công viên Thống Nhất
     Ngày bắt đầu: [Chọn ngày tương lai]
     Giờ bắt đầu: 08:00
     Ngày kết thúc: [Cùng ngày hoặc sau]
     Giờ kết thúc: 17:00
     Mô tả: Tham gia trồng cây xanh để bảo vệ môi trường
     Sức chứa: 50
     ```
   - Click "Lưu sự kiện"
   - **Kết quả mong đợi:** Thông báo tạo sự kiện thành công

---

### Bước 3: Kiểm tra trên Landing Page (Người dùng công khai)

1. **Mở trang chủ:**

   - Truy cập: http://localhost:3000
   - Không cần đăng nhập

2. **Kiểm tra section "Sự kiện chờ duyệt":**

   - Scroll xuống trang
   - Sau phần "Sự kiện nổi bật" sẽ thấy section mới
   - **Tiêu đề:** "Sự kiện chờ duyệt"
   - **Màu nền:** Gradient vàng/amber
   - **Badge:** "Đang chờ duyệt" với icon animate

3. **Kiểm tra card sự kiện:**

   - Sự kiện vừa tạo sẽ hiển thị với:
     - ✅ Border màu vàng (amber-400)
     - ✅ Badge "Đang chờ duyệt" với animation pulse
     - ✅ Tên sự kiện
     - ✅ Địa điểm và ngày tháng
     - ✅ Button "Chờ duyệt" bị disable (màu xám)

4. **Thông tin bổ sung:**
   - Cuối section có hộp thông tin màu vàng
   - Nội dung: "Các sự kiện này sẽ được admin xem xét..."

---

### Bước 4: Kiểm tra Notification cho Admin

1. **Đăng xuất khỏi Manager (nếu đang đăng nhập)**

2. **Đăng nhập Admin:**

   - Truy cập: http://localhost:3000/admin
   - Đăng nhập với tài khoản có role ADMIN

3. **Kiểm tra Notification:**
   - Vào Dashboard Admin
   - Click vào icon Notification (chuông) ở header
   - **Kết quả mong đợi:**
     - Có thông báo mới
     - Tiêu đề: "Sự kiện mới chờ duyệt"
     - Nội dung: "Sự kiện 'Chiến dịch trồng cây xanh 2024' do [Tên Manager] vừa tạo đang chờ duyệt."
     - Badge màu đỏ hiển thị số lượng thông báo chưa đọc

---

### Bước 5: Phê duyệt sự kiện (Admin)

1. **Vào quản lý sự kiện:**

   - Click menu "Quản lý sự kiện"
   - Hoặc truy cập: http://localhost:3000/admin/eventManage

2. **Tìm sự kiện pending:**

   - Sự kiện vừa tạo sẽ có trạng thái "PENDING"
   - Màu badge màu vàng

3. **Phê duyệt sự kiện:**

   - Click vào sự kiện
   - Click button "Phê duyệt" hoặc "Approve"
   - Confirm action

4. **Kết quả:**
   - Status đổi thành "APPROVED"
   - Badge chuyển sang màu xanh

---

### Bước 6: Kiểm tra sau khi Approve

1. **Quay lại Landing Page:**

   - Truy cập: http://localhost:3000
   - Refresh trang

2. **Kiểm tra thay đổi:**

   - ✅ Sự kiện KHÔNG còn ở section "Sự kiện chờ duyệt"
   - ✅ Sự kiện XUẤT HIỆN ở section "Sự kiện nổi bật" (Destination)
   - ✅ Button "Đăng ký" đã được enable
   - ✅ User có thể click để đăng ký tham gia

3. **Kiểm tra nếu KHÔNG còn sự kiện pending:**
   - Section "Sự kiện chờ duyệt" sẽ tự động ẨN
   - Không hiển thị gì cả

---

## 🔍 Các trường hợp test khác

### Test 1: Tạo nhiều sự kiện pending

- Tạo 3-4 sự kiện với tài khoản Manager
- Kiểm tra tất cả đều hiển thị ở section "Sự kiện chờ duyệt"
- Grid layout: 4 columns trên desktop, responsive trên mobile

### Test 2: Button "Xem thêm"

- Tạo hơn 4 sự kiện pending
- Kiểm tra button "Xem thêm sự kiện chờ duyệt" xuất hiện
- Click button, kiểm tra load thêm 4 sự kiện tiếp theo

### Test 3: Reject sự kiện

- Admin reject một sự kiện
- Kiểm tra sự kiện không hiển thị ở bất kỳ đâu trên landing page
- Status thay đổi thành "REJECTED"

### Test 4: Notification cho nhiều Admin

- Tạo nhiều tài khoản Admin
- Manager tạo sự kiện mới
- Tất cả Admin đều nhận được notification

---

## ✅ Checklist hoàn chỉnh

- [ ] Backend chạy không lỗi
- [ ] Frontend chạy không lỗi
- [ ] Đăng nhập Manager thành công
- [ ] Tạo sự kiện thành công
- [ ] Sự kiện hiển thị ở Landing Page (section "Sự kiện chờ duyệt")
- [ ] Card sự kiện có border và badge màu vàng
- [ ] Button "Chờ duyệt" bị disable
- [ ] Admin nhận được notification
- [ ] Notification có đúng nội dung
- [ ] Admin approve sự kiện thành công
- [ ] Sau approve, sự kiện chuyển sang section chính
- [ ] Sau approve, section "Chờ duyệt" ẩn (nếu không còn sự kiện pending)
- [ ] User có thể đăng ký sự kiện đã approve

---

## 🐛 Troubleshooting

### Lỗi: Không thấy section "Sự kiện chờ duyệt"

**Nguyên nhân:** Không có sự kiện pending nào
**Giải pháp:**

- Tạo sự kiện mới với Manager
- Hoặc check API: http://localhost:8080/api/events?status=PENDING

### Lỗi: Không nhận được notification

**Nguyên nhân:**

1. Tài khoản không phải Admin
2. Tài khoản Admin bị inactive

**Giải pháp:**

- Check role trong database
- Đảm bảo `is_active = true`

### Lỗi: Card sự kiện không có ảnh

**Nguyên nhân:** Không upload ảnh khi tạo sự kiện
**Giải pháp:** Sử dụng ảnh mặc định, hoặc upload ảnh trong form

### Lỗi: API trả về 404

**Nguyên nhân:** Backend chưa chạy hoặc port sai
**Giải pháp:**

- Check backend đang chạy: http://localhost:8080
- Check API_BASE_URL trong `eventService.js`

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Console log trong browser (F12)
2. Terminal log của Backend
3. Network tab để xem API requests
4. Database để xem data thực tế

---

**Chúc test thành công! 🎉**
