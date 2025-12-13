-- Migration: Add/Update comments for entity tables and add/update constraints
-- Created: 2025-12-13
-- Wraps all COMMENT statements in a transaction for better performance and atomicity

BEGIN;

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================
COMMENT ON TABLE users IS 'Bảng quản lý người dùng hệ thống (tình nguyện viên, admin, organizer)';
COMMENT ON TABLE events IS 'Bảng quản lý các sự kiện tình nguyện';
COMMENT ON TABLE registrations IS 'Bảng quản lý đơn đăng ký tình nguyện của user cho sự kiện';
COMMENT ON TABLE posts IS 'Bảng quản lý bài viết của user trong các sự kiện';
COMMENT ON TABLE comments IS 'Bảng quản lý bình luận trên bài viết';
COMMENT ON TABLE post_reactions IS 'Bảng quản lý reaction của user trên bài viết';
COMMENT ON TABLE roles IS 'Bảng quản lý vai trò của user (ADMIN, USER, ORGANIZER, etc.)';
COMMENT ON TABLE notifications IS 'Bảng quản lý thông báo gửi đến user';

-- Column comments: users
COMMENT ON COLUMN users.user_id IS 'Primary key UUID của user';
COMMENT ON COLUMN users.name IS 'Tên hiển thị của user';
COMMENT ON COLUMN users.email IS 'Email đăng nhập (duy nhất)';
COMMENT ON COLUMN users.password IS 'Mật khẩu đã mã hóa (BCrypt)';
COMMENT ON COLUMN users.is_active IS 'Trạng thái kích hoạt tài khoản (true = active, false = locked)';
COMMENT ON COLUMN users.created_at IS 'Thời điểm tạo bản ghi user';
COMMENT ON COLUMN users.updated_at IS 'Thời điểm cập nhật bản ghi user';

-- Column comments: events
COMMENT ON COLUMN events.event_id IS 'Primary key UUID cho sự kiện';
COMMENT ON COLUMN events.created_by_user_id IS 'ID của user tạo sự kiện (organizer)';
COMMENT ON COLUMN events.title IS 'Tiêu đề sự kiện';
COMMENT ON COLUMN events.description IS 'Mô tả chi tiết về sự kiện';
COMMENT ON COLUMN events.location IS 'Địa điểm tổ chức sự kiện';
COMMENT ON COLUMN events.start_time IS 'Thời gian bắt đầu sự kiện';
COMMENT ON COLUMN events.end_time IS 'Thời gian kết thúc sự kiện';
COMMENT ON COLUMN events.max_volunteers IS 'Số lượng tình nguyện viên tối đa (null = không giới hạn)';
COMMENT ON COLUMN events.admin_approval_status IS 'Trạng thái duyệt của admin: PENDING (Sự kiện chờ admin phê duyệt); APPROVED (Admin đã phê duyệt; sự kiện hiển thị công khai); REJECTED (Admin từ chối sự kiện)';
COMMENT ON COLUMN events.is_archived IS 'Cờ đánh dấu sự kiện đã được lưu trữ (ẩn khỏi danh sách công khai)';
COMMENT ON COLUMN events.created_at IS 'Thời điểm tạo sự kiện';
COMMENT ON COLUMN events.updated_at IS 'Thời điểm cập nhật sự kiện';

-- Column comments: registrations
COMMENT ON COLUMN registrations.registration_id IS 'Primary key UUID cho bản ghi registration';
COMMENT ON COLUMN registrations.user_id IS 'ID của user (volunteer) đã đăng ký';
COMMENT ON COLUMN registrations.event_id IS 'ID của sự kiện được đăng ký';
COMMENT ON COLUMN registrations.registration_status IS 'Trạng thái đơn đăng ký: PENDING (Chờ duyệt bởi admin); APPROVED (Admin đã duyệt, user có thể check-in); REJECTED (Admin từ chối đơn); WITHDRAWN (User tự hủy đăng ký); CHECKED_IN (User đã check-in tại sự kiện); COMPLETED (Admin xác nhận user hoàn thành công việc)';
COMMENT ON COLUMN registrations.checked_in_at IS 'Thời điểm user check-in tại sự kiện';
COMMENT ON COLUMN registrations.completed_at IS 'Thời điểm admin xác nhận hoàn thành sự kiện';
COMMENT ON COLUMN registrations.completed_by_user_id IS 'ID của admin xác nhận hoàn thành';
COMMENT ON COLUMN registrations.approved_by_user_id IS 'ID của admin duyệt đơn đăng ký';
COMMENT ON COLUMN registrations.completion_notes IS 'Ghi chú về việc hoàn thành sự kiện';
COMMENT ON COLUMN registrations.is_completed IS '(Deprecated) Cờ đánh dấu hoàn thành - dùng registration_status=COMPLETED thay thế';
COMMENT ON COLUMN registrations.withdrawn_at IS 'Thời điểm user rút đăng ký (WITHDRAWN); null nếu không rút';
COMMENT ON COLUMN registrations.registered_at IS 'Thời điểm user nộp đơn/đăng ký';
COMMENT ON COLUMN registrations.updated_at IS 'Thời điểm cập nhật cuối của bản ghi';

-- Column comments: posts
COMMENT ON COLUMN posts.post_id IS 'Primary key UUID của post';
COMMENT ON COLUMN posts.event_id IS 'ID của sự kiện chứa bài viết';
COMMENT ON COLUMN posts.user_id IS 'ID của user viết bài (author)';
COMMENT ON COLUMN posts.content IS 'Nội dung bài viết';
COMMENT ON COLUMN posts.created_at IS 'Thời điểm tạo bài viết';
COMMENT ON COLUMN posts.updated_at IS 'Thời điểm cập nhật bài viết';

-- Column comments: comments
COMMENT ON COLUMN comments.comment_id IS 'Primary key UUID của comment';
COMMENT ON COLUMN comments.content IS 'Nội dung bình luận';
COMMENT ON COLUMN comments.post_id IS 'ID của bài viết được bình luận';
COMMENT ON COLUMN comments.user_id IS 'ID của user viết bình luận';
COMMENT ON COLUMN comments.parent_id IS 'ID của comment cha (nếu là reply)';
COMMENT ON COLUMN comments.created_at IS 'Thời điểm tạo bình luận';
COMMENT ON COLUMN comments.updated_at IS 'Thời điểm cập nhật bình luận';

-- Column comments: post_reactions
COMMENT ON COLUMN post_reactions.reaction_id IS 'Primary key UUID của reaction';
COMMENT ON COLUMN post_reactions.post_id IS 'ID của bài viết được react';
COMMENT ON COLUMN post_reactions.user_id IS 'ID của user thực hiện react';
COMMENT ON COLUMN post_reactions.reaction_type IS 'Loại reaction: LIKE (Thích); CARE (Quan tâm); LOVE (Yêu thích); HAHA (Cười); WOW (Ngạc nhiên); SAD (Buồn); ANGRY (Giận)';
COMMENT ON COLUMN post_reactions.created_at IS 'Thời điểm reaction được tạo';
COMMENT ON COLUMN post_reactions.updated_at IS 'Thời điểm cập nhật reaction';

-- Column comments: roles
COMMENT ON COLUMN roles.role_id IS 'Primary key UUID của role';
COMMENT ON COLUMN roles.role_name IS 'Tên vai trò (ví dụ: ADMIN, USER, ORGANIZER)';
COMMENT ON COLUMN roles.description IS 'Mô tả chi tiết về vai trò';
COMMENT ON COLUMN roles.created_at IS 'Thời điểm tạo vai trò';
COMMENT ON COLUMN roles.updated_at IS 'Thời điểm cập nhật vai trò';

-- Column comments: notifications
COMMENT ON COLUMN notifications.notification_id IS 'Primary key UUID của notification';
COMMENT ON COLUMN notifications.user_id IS 'ID của user nhận thông báo';
COMMENT ON COLUMN notifications.event_id IS 'ID của sự kiện liên quan (null nếu không liên quan)';
COMMENT ON COLUMN notifications.title IS 'Tiêu đề thông báo';
COMMENT ON COLUMN notifications.body IS 'Nội dung chi tiết thông báo';
COMMENT ON COLUMN notifications.notification_type IS 'Loại thông báo: REGISTRATION_SUBMITTED (User nộp đơn đăng ký); REGISTRATION_CONFIRMED (Admin phê duyệt đăng ký); REGISTRATION_REJECTED (Admin từ chối đăng ký); COMPLETION_MARKED (Admin xác nhận hoàn thành); EVENT_CREATED_PENDING (Sự kiện mới chờ duyệt); EVENT_APPROVED (Sự kiện được phê duyệt); EVENT_REJECTED (Sự kiện bị từ chối); EVENT_UPDATED (Organizer cập nhật sự kiện); NEW_POST (Có bài viết mới); NEW_COMMENT (Có bình luận mới); ACCOUNT_LOCKED (Tài khoản bị khóa); ACCOUNT_UNLOCKED (Tài khoản được mở khóa); SYSTEM_ANNOUNCEMENT (Thông báo hệ thống); DATA_EXPORT_READY (Dữ liệu export đã sẵn sàng)';
COMMENT ON COLUMN notifications.is_read IS 'Trạng thái đã đọc (true = đã đọc, false = chưa đọc)';
COMMENT ON COLUMN notifications.created_at IS 'Thời điểm tạo thông báo';
COMMENT ON COLUMN notifications.updated_at IS 'Thời điểm cập nhật thông báo';

-- ============================================================================
-- CONSTRAINT UPDATES: Ensure enums are enforced at DB level
-- ============================================================================

-- Update registrations.registration_status constraint to include new states
ALTER TABLE registrations
    DROP CONSTRAINT IF EXISTS registrations_registration_status_check;

ALTER TABLE registrations
    ADD CONSTRAINT registrations_registration_status_check
    CHECK (registration_status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'CHECKED_IN', 'COMPLETED'
    ));

-- Add constraint for post_reactions.reaction_type
ALTER TABLE post_reactions
    DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

ALTER TABLE post_reactions
    ADD CONSTRAINT post_reactions_reaction_type_check
    CHECK (reaction_type IN (
        'LIKE', 'CARE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'
    ));

-- Add constraint for notifications.notification_type
ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_notification_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_notification_type_check
    CHECK (notification_type IN (
        'REGISTRATION_SUBMITTED', 'REGISTRATION_CONFIRMED', 'REGISTRATION_REJECTED',
        'COMPLETION_MARKED', 'EVENT_CREATED_PENDING', 'EVENT_APPROVED', 'EVENT_REJECTED',
        'EVENT_UPDATED', 'NEW_POST', 'NEW_COMMENT', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED',
        'SYSTEM_ANNOUNCEMENT', 'DATA_EXPORT_READY'
    ));

-- Add constraint for events.admin_approval_status
ALTER TABLE events
    DROP CONSTRAINT IF EXISTS events_admin_approval_status_check;

ALTER TABLE events
    ADD CONSTRAINT events_admin_approval_status_check
    CHECK (admin_approval_status IN (
        'PENDING', 'APPROVED', 'REJECTED'
    ));

COMMIT;

-- End of migration
