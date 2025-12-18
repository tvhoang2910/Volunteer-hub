package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationCompletionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CheckInResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ParticipantResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationApprovalResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationCompletionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationRejectionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;

/**
 * EventService
 * <p>
 * Interface định nghĩa toàn bộ nghiệp vụ liên quan đến quản lý sự kiện tình nguyện
 * trong hệ thống Volunteer Hub.
 * </p>
 *
 * <p>
 * Bao gồm các nhóm chức năng chính:
 * <ul>
 *   <li>Quản lý sự kiện (tạo, cập nhật, duyệt, từ chối, xoá)</li>
 *   <li>Lấy danh sách và chi tiết sự kiện</li>
 *   <li>Đăng ký / huỷ đăng ký tham gia sự kiện</li>
 *   <li>Check-in tình nguyện viên</li>
 *   <li>Quản lý đăng ký tham gia (approve / reject / complete)</li>
 * </ul>
 * </p>
 *
 * <p>
 * Interface này được implement bởi {@code EventServiceImpl}.
 * </p>
 */
public interface EventService {

    /* ============================================================
     * ADMIN / BASIC EVENT MANAGEMENT
     * ============================================================ */

    /**
     * Duyệt một sự kiện.
     * <p>
     * Thường được gọi bởi admin hoặc manager để chuyển trạng thái
     * sự kiện từ {@code PENDING} sang {@code APPROVED}.
     * </p>
     *
     * @param id ID của sự kiện cần duyệt
     */
    void approveEventStatus(UUID id);

    /**
     * Từ chối một sự kiện.
     * <p>
     * Sự kiện sẽ được chuyển sang trạng thái {@code REJECTED}
     * và không hiển thị trong danh sách công khai.
     * </p>
     *
     * @param id ID của sự kiện cần từ chối
     */
    void rejectEventStatus(UUID id);

    /**
     * Xoá một sự kiện khỏi hệ thống.
     * <p>
     * Chỉ áp dụng cho admin hoặc chủ sở hữu sự kiện
     * tuỳ theo chính sách phân quyền.
     * </p>
     *
     * @param id ID của sự kiện cần xoá
     */
    void deleteEvent(UUID id);

    /**
     * Lấy danh sách toàn bộ sự kiện (bao gồm cả chưa duyệt).
     * <p>
     * Thường dùng cho admin dashboard.
     * </p>
     *
     * @return danh sách tất cả sự kiện
     */
    List<Event> getAllEvents();

    /* ============================================================
     * PUBLIC EVENTS
     * ============================================================ */

    /**
     * Lấy danh sách các sự kiện đã được duyệt và chưa bị lưu trữ.
     * <p>
     * Phục vụ cho event feed phía người dùng.
     * </p>
     *
     * @return danh sách sự kiện đã được duyệt
     */
    List<Event> getApprovedEvents();

    /**
     * Lấy chi tiết một sự kiện đã được duyệt.
     * <p>
     * Nếu sự kiện chưa được duyệt hoặc đã bị lưu trữ,
     * method có thể throw exception.
     * </p>
     *
     * @param id ID của sự kiện
     * @return entity Event tương ứng
     */
    Event getApprovedEvent(UUID id);

    /* ============================================================
     * CREATE / UPDATE EVENT
     * ============================================================ */

    /**
     * Tạo mới một sự kiện.
     * <p>
     * Người dùng (hoặc manager) gửi thông tin sự kiện,
     * sự kiện mặc định sẽ ở trạng thái {@code PENDING}.
     * </p>
     *
     * @param request   thông tin tạo sự kiện
     * @param creatorId ID của user tạo sự kiện
     * @return thông tin sự kiện vừa tạo
     */
    EventResponseDTO createEvent(CreateEventRequest request, UUID creatorId);

    /**
     * Cập nhật thông tin một sự kiện.
     * <p>
     * Chỉ cho phép chủ sự kiện hoặc manager cập nhật,
     * và thường chỉ được cập nhật trước khi sự kiện bắt đầu.
     * </p>
     *
     * @param eventId   ID của sự kiện
     * @param request   thông tin cập nhật
     * @param updaterId ID của user thực hiện cập nhật
     * @return thông tin sự kiện sau khi cập nhật
     */
    EventResponseDTO updateEvent(UUID eventId, UpdateEventRequest request, UUID updaterId);

    /* ============================================================
     * FILTER & SEARCH
     * ============================================================ */

    /**
     * Lấy danh sách sự kiện theo điều kiện lọc.
     * <p>
     * Hỗ trợ tìm kiếm theo:
     * <ul>
     *   <li>Từ khoá (title, description)</li>
     *   <li>Danh mục</li>
     *   <li>Khoảng thời gian</li>
     *   <li>Trạng thái duyệt</li>
     * </ul>
     * </p>
     *
     * @param searchQuery từ khoá tìm kiếm
     * @param category    danh mục sự kiện
     * @param fromDate    thời gian bắt đầu từ
     * @param toDate      thời gian kết thúc trước
     * @param status      trạng thái duyệt
     * @return danh sách sự kiện phù hợp
     */
    List<Event> getEventsWithFilters(
            String searchQuery,
            String category,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            EventApprovalStatus status
    );

    /* ============================================================
     * PARTICIPATION
     * ============================================================ */

    /**
     * Đăng ký tham gia một sự kiện.
     *
     * @param eventId ID của sự kiện
     * @param userId  ID của user tham gia
     * @return kết quả đăng ký
     */
    JoinEventResponse joinEvent(UUID eventId, UUID userId);

    /**
     * Huỷ đăng ký tham gia một sự kiện.
     *
     * @param eventId ID của sự kiện
     * @param userId  ID của user
     * @return kết quả huỷ đăng ký
     */
    JoinEventResponse leaveEvent(UUID eventId, UUID userId);

    /**
     * Lấy danh sách người tham gia một sự kiện.
     *
     * @param eventId ID của sự kiện
     * @return danh sách participant
     */
    List<ParticipantResponseDTO> getParticipants(UUID eventId);

    /**
     * Check-in tình nguyện viên tại sự kiện.
     * <p>
     * Thường được dùng tại thời điểm sự kiện diễn ra.
     * </p>
     *
     * @param eventId ID của sự kiện
     * @param userId  ID của user
     * @return kết quả check-in
     */
    CheckInResponseDTO checkInVolunteer(UUID eventId, UUID userId, UUID checkerId);

    /* ============================================================
     * REGISTRATION MANAGEMENT
     * ============================================================ */

    /**
     * Duyệt đăng ký tham gia sự kiện.
     *
     * @param registrationId   ID của bản ghi đăng ký
     * @param approvedByUserId ID của user duyệt
     * @return kết quả duyệt
     */
    RegistrationApprovalResponseDTO approveRegistration(UUID registrationId, UUID approvedByUserId);

    /**
     * Từ chối đăng ký tham gia sự kiện.
     *
     * @param registrationId ID của bản ghi đăng ký
     * @return kết quả từ chối
     */
    RegistrationRejectionResponseDTO rejectRegistration(UUID registrationId, UUID actorId);

    /**
     * Đánh dấu hoàn thành đăng ký (sau khi sự kiện kết thúc).
     *
     * @param registrationId ID của bản ghi đăng ký
     * @param request        thông tin hoàn thành
     * @return kết quả hoàn thành
     */
    RegistrationCompletionResponseDTO completeRegistration(
            UUID registrationId,
            RegistrationCompletionRequest request,
            UUID actorId
    );
}
